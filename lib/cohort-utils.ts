import type {
  CohortAnalysis,
  Customer,
  CohortData,
  CohortRepurchaseAnalysis,
  SegmentSummary,
  RevenueMetrics,
  CohortRevMetric,
  PurchaseOrderMetrics,
  RecencyMetrics,
  ProductBundle,
  TicketDriver,
  FirstPurchaseProduct,
  TopNextPurchase,
  MissingBundleOpportunity,
  Purchase,
} from './types'

// ---------------------------------------------------------------------------
// CSV parser
// ---------------------------------------------------------------------------

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }
  result.push(current)
  return result
}

export function parseCSV(csvText: string): Record<string, unknown>[] {
  const lines = csvText.split('\n').filter((line) => line.trim())
  if (lines.length < 2) return []

  const headers = parseCSVLine(lines[0]).map((h) =>
    h.trim().replace(/^\uFEFF/, '')
  )

  return lines
    .slice(1)
    .map((line) => {
      const values = parseCSVLine(line)
      const row: Record<string, unknown> = {}
      headers.forEach((header, i) => {
        row[header] = (values[i] ?? '').trim()
      })
      return row
    })
    .filter((row) => Object.values(row).some((v) => v !== ''))
}

// ---------------------------------------------------------------------------
// Column mapping helpers
// ---------------------------------------------------------------------------

const EMAIL_KEYS = ['email', 'Email', 'correo', 'Correo', 'customer_email', 'e-mail', 'E-mail', 'mail']
const DATE_KEYS = [
  'created_at', 'fecha', 'Fecha', 'date', 'Date', 'order_date', 'payment_date',
  'fecha_pago', 'Fecha de pago', 'Fecha creacion', 'fecha_creacion', 'Fecha de creación',
  'paid_at', 'completed_at',
]
const AMOUNT_KEYS = [
  'total', 'Total', 'amount', 'Amount', 'precio', 'Precio', 'monto', 'Monto',
  'subtotal', 'Subtotal', 'revenue', 'Revenue', 'price', 'Price',
  'total_price', 'order_total', 'Subtotal (ARS)', 'Subtotal (USD)', 'Total (ARS)',
  'Importe total (ARS)', 'Importe total (USD)', 'Importe total',
]
const PRODUCT_KEYS = [
  'product', 'Product', 'producto', 'Producto', 'item', 'Item',
  'product_name', 'name', 'Name', 'sku', 'SKU',
  'Nombre del producto', 'nombre_producto', 'Productos',
]

// Prefix patterns used as fallback when exact key matching fails
const AMOUNT_PREFIXES = ['Importe total', 'importe total', 'Total (', 'total (']

function findKey(row: Record<string, unknown>, candidates: string[]): string | null {
  for (const key of candidates) {
    if (key in row) return key
  }
  return null
}

function findKeyByPrefix(row: Record<string, unknown>, prefixes: string[]): string | null {
  for (const key of Object.keys(row)) {
    for (const prefix of prefixes) {
      if (key.startsWith(prefix)) return key
    }
  }
  return null
}

function resolveKeys(rows: Record<string, unknown>[]) {
  if (rows.length === 0) return { emailKey: null, dateKey: null, amountKey: null, productKey: null }
  const sample = rows[0]
  return {
    emailKey: findKey(sample, EMAIL_KEYS),
    dateKey: findKey(sample, DATE_KEYS),
    amountKey: findKey(sample, AMOUNT_KEYS) ?? findKeyByPrefix(sample, AMOUNT_PREFIXES),
    productKey: findKey(sample, PRODUCT_KEYS),
  }
}

function parseAmount(value: unknown): number {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^0-9.,\-]/g, '').replace(',', '.')
    const num = parseFloat(cleaned)
    return isNaN(num) ? 0 : num
  }
  return 0
}

function parseDate(value: unknown): Date | null {
  if (!value) return null
  if (value instanceof Date) return value

  const str = String(value).trim()
  if (!str) return null

  // Try ISO format first
  let d = new Date(str)
  if (!isNaN(d.getTime())) return d

  // Try DD/MM/YYYY
  const dmyMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (dmyMatch) {
    d = new Date(parseInt(dmyMatch[3]), parseInt(dmyMatch[2]) - 1, parseInt(dmyMatch[1]))
    if (!isNaN(d.getTime())) return d
  }

  return null
}

function toCohortKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function diffMonths(d1: Date, d2: Date): number {
  return (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth())
}

function daysBetween(d1: Date, d2: Date): number {
  return Math.round(Math.abs(d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24))
}

// ---------------------------------------------------------------------------
// RFM segmentation
// ---------------------------------------------------------------------------

function assignRFMSegment(customer: Customer, now: Date): string {
  const lastPurchaseDate = new Date(
    customer.purchases[customer.purchases.length - 1]?.paymentDate ?? customer.firstPurchaseDate
  )
  const daysSinceLastPurchase = daysBetween(lastPurchaseDate, now)
  const frequency = customer.totalOrders
  const totalSpend = customer.purchases.reduce((s, p) => s + p.amount, 0)
  const avgOrderValue = frequency > 0 ? totalSpend / frequency : 0

  if (daysSinceLastPurchase <= 90 && frequency >= 3) return 'Loyal'
  if (daysSinceLastPurchase <= 180 && frequency >= 2) return 'Potential'
  if (daysSinceLastPurchase > 180 && frequency >= 2) return 'At Risk'
  return 'Lost'
}

function assignMomentumSegment(customer: Customer): string {
  if (customer.purchases.length < 2) return 'Stable'

  const sorted = [...customer.purchases].sort(
    (a, b) => new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime()
  )
  const mid = Math.floor(sorted.length / 2)
  const firstHalf = sorted.slice(0, mid)
  const secondHalf = sorted.slice(mid)

  const firstAvg = firstHalf.reduce((s, p) => s + p.amount, 0) / firstHalf.length
  const secondAvg = secondHalf.reduce((s, p) => s + p.amount, 0) / secondHalf.length

  if (firstAvg === 0) return 'Stable'
  const change = ((secondAvg - firstAvg) / firstAvg) * 100
  if (change > 10) return 'Accelerating'
  if (change < -10) return 'Slowing'
  return 'Stable'
}

function assignHealthStatus(customer: Customer, now: Date): { status: string; subSegment: string } {
  const lastPurchaseDate = new Date(
    customer.purchases[customer.purchases.length - 1]?.paymentDate ?? customer.firstPurchaseDate
  )
  const daysSince = daysBetween(lastPurchaseDate, now)
  const totalSpend = customer.purchases.reduce((s, p) => s + p.amount, 0)
  const avgSpend = customer.totalOrders > 0 ? totalSpend / customer.totalOrders : 0

  if (daysSince <= 90) {
    if (customer.totalOrders >= 3 && avgSpend > 0) return { status: 'ACTIVO', subSegment: 'CHAMPIONS' }
    if (daysSince >= 60) return { status: 'ACTIVO', subSegment: 'EN_RIESGO' }
    return { status: 'ACTIVO', subSegment: 'REGULARES' }
  }
  if (daysSince <= 365) return { status: 'DORMIDO', subSegment: 'RECUPERABLES' }
  return { status: 'DORMIDO', subSegment: 'INACTIVO' }
}

// ---------------------------------------------------------------------------
// RFM summary
// ---------------------------------------------------------------------------

function buildRFMSegments(customers: Customer[]): SegmentSummary[] {
  const segmentNames = ['Loyal', 'Potential', 'At Risk', 'Lost']
  const totalRevenue = customers.reduce(
    (sum, c) => sum + c.purchases.reduce((s, p) => s + p.amount, 0),
    0
  )

  return segmentNames.map((segment) => {
    const segCustomers = customers.filter((c) => c.rfm_segment === segment)
    const segRevenue = segCustomers.reduce(
      (sum, c) => sum + c.purchases.reduce((s, p) => s + p.amount, 0),
      0
    )
    const count = segCustomers.length
    return {
      segment,
      customer_count: count,
      percentage_of_customers: customers.length > 0 ? (count / customers.length) * 100 : 0,
      total_revenue: segRevenue,
      revenue_share: totalRevenue > 0 ? (segRevenue / totalRevenue) * 100 : 0,
      avg_revenue_per_customer: count > 0 ? segRevenue / count : 0,
    }
  })
}

// ---------------------------------------------------------------------------
// Revenue metrics
// ---------------------------------------------------------------------------

function buildRevenueMetrics(customers: Customer[], now: Date): RevenueMetrics {
  const cohortMap = new Map<string, Customer[]>()
  for (const c of customers) {
    if (!cohortMap.has(c.cohort)) cohortMap.set(c.cohort, [])
    cohortMap.get(c.cohort)!.push(c)
  }

  const totalRevenue = customers.reduce(
    (sum, c) => sum + c.purchases.reduce((s, p) => s + p.amount, 0),
    0
  )
  const firstPurchaseRevenue = customers.reduce(
    (sum, c) => sum + (c.purchases[0]?.amount ?? 0),
    0
  )
  const repurchaseRevenue = totalRevenue - firstPurchaseRevenue

  // Per-customer LTV at different windows
  function avgLtv(months: number): number {
    const ltvs = customers.map((c) => {
      const cutoff = new Date(c.firstPurchaseDate)
      cutoff.setMonth(cutoff.getMonth() + months)
      return c.purchases
        .filter((p) => new Date(p.paymentDate) <= cutoff)
        .reduce((s, p) => s + p.amount, 0)
    })
    return ltvs.length > 0 ? ltvs.reduce((a, b) => a + b, 0) / ltvs.length : 0
  }

  // Revenue accumulated by month (across all customers, indexed 1-6)
  function avgRevenueByMonth(month: number): number {
    const revenues = customers.map((c) => {
      const cutoff = new Date(c.firstPurchaseDate)
      cutoff.setMonth(cutoff.getMonth() + month)
      const prev = new Date(c.firstPurchaseDate)
      prev.setMonth(prev.getMonth() + month - 1)
      return c.purchases
        .filter((p) => {
          const pd = new Date(p.paymentDate)
          return pd > prev && pd <= cutoff
        })
        .reduce((s, p) => s + p.amount, 0)
    })
    return revenues.length > 0 ? revenues.reduce((a, b) => a + b, 0) / revenues.length : 0
  }

  const cohortMetrics: CohortRevMetric[] = Array.from(cohortMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([cohort, cohortCustomers]) => {
      const cohortTotalRevenue = cohortCustomers.reduce(
        (sum, c) => sum + c.purchases.reduce((s, p) => s + p.amount, 0),
        0
      )
      const cohortFirstRevenue = cohortCustomers.reduce(
        (sum, c) => sum + (c.purchases[0]?.amount ?? 0),
        0
      )
      const cohortRepurchaseRevenue = cohortTotalRevenue - cohortFirstRevenue

      const ltvAtMonth = (months: number) => {
        const vals = cohortCustomers.map((c) => {
          const cutoff = new Date(c.firstPurchaseDate)
          cutoff.setMonth(cutoff.getMonth() + months)
          return c.purchases
            .filter((p) => new Date(p.paymentDate) <= cutoff)
            .reduce((s, p) => s + p.amount, 0)
        })
        return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0
      }

      const revenueByMonth = Array.from({ length: 12 }, (_, i) => {
        return cohortCustomers.reduce((sum, c) => {
          const monthStart = new Date(c.firstPurchaseDate)
          monthStart.setMonth(monthStart.getMonth() + i)
          const monthEnd = new Date(c.firstPurchaseDate)
          monthEnd.setMonth(monthEnd.getMonth() + i + 1)
          return (
            sum +
            c.purchases
              .filter((p) => {
                const pd = new Date(p.paymentDate)
                return pd >= monthStart && pd < monthEnd
              })
              .reduce((s, p) => s + p.amount, 0)
          )
        }, 0)
      })

      return {
        cohort,
        ltv1m: ltvAtMonth(1),
        ltv3m: ltvAtMonth(3),
        ltv6m: ltvAtMonth(6),
        ltv12m: ltvAtMonth(12),
        revenueByMonth,
        firstPurchaseRevenue: cohortFirstRevenue,
        repurchaseRevenue: cohortRepurchaseRevenue,
        repurchasePercent:
          cohortTotalRevenue > 0
            ? (cohortRepurchaseRevenue / cohortTotalRevenue) * 100
            : 0,
      }
    })

  return {
    totalRevenue,
    avgLtv1m: avgLtv(1),
    avgLtv3m: avgLtv(3),
    avgLtv6m: avgLtv(6),
    avgLtv12m: avgLtv(12),
    totalFirstPurchaseRevenue: firstPurchaseRevenue,
    totalRepurchaseRevenue: repurchaseRevenue,
    firstPurchasePercent: totalRevenue > 0 ? (firstPurchaseRevenue / totalRevenue) * 100 : 0,
    repurchasePercent: totalRevenue > 0 ? (repurchaseRevenue / totalRevenue) * 100 : 0,
    avgRevenue1m: avgRevenueByMonth(1),
    avgRevenue2m: avgRevenueByMonth(2),
    avgRevenue3m: avgRevenueByMonth(3),
    avgRevenue4m: avgRevenueByMonth(4),
    avgRevenue5m: avgRevenueByMonth(5),
    avgRevenue6m: avgRevenueByMonth(6),
    cohortMetrics,
  }
}

// ---------------------------------------------------------------------------
// Order metrics
// ---------------------------------------------------------------------------

function buildOrderMetrics(customers: Customer[]): PurchaseOrderMetrics {
  const byOrderNum: number[][] = [[], [], [], [], []] // index 0 = 1st order amounts

  for (const c of customers) {
    const sorted = [...c.purchases].sort(
      (a, b) => new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime()
    )
    sorted.forEach((p, i) => {
      if (i < 5) byOrderNum[i].push(p.amount)
    })
  }

  const aov = (arr: number[]) =>
    arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0

  const counts = byOrderNum.map((arr) => arr.length)
  const retention = (from: number, to: number) =>
    counts[from] > 0 ? (counts[to] / counts[from]) * 100 : 0

  return {
    aov1: aov(byOrderNum[0]),
    aov2: aov(byOrderNum[1]),
    aov3: aov(byOrderNum[2]),
    aov4: aov(byOrderNum[3]),
    aov5: aov(byOrderNum[4]),
    customers1: counts[0],
    customers2: counts[1],
    customers3: counts[2],
    customers4: counts[3],
    customers5: counts[4],
    retention1to2: retention(0, 1),
    retention2to3: retention(1, 2),
    retention3to4: retention(2, 3),
    retention4to5: retention(3, 4),
    dropoff1to2: 100 - retention(0, 1),
    dropoff2to3: 100 - retention(1, 2),
    dropoff3to4: 100 - retention(2, 3),
    dropoff4to5: 100 - retention(3, 4),
  }
}

// ---------------------------------------------------------------------------
// Recency metrics
// ---------------------------------------------------------------------------

function buildRecencyMetrics(customers: Customer[]): RecencyMetrics {
  function avgDaysBetweenOrders(orderFrom: number, orderTo: number) {
    const gaps: number[] = []
    for (const c of customers) {
      const sorted = [...c.purchases].sort(
        (a, b) => new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime()
      )
      if (sorted.length > orderTo) {
        const d1 = new Date(sorted[orderFrom].paymentDate)
        const d2 = new Date(sorted[orderTo].paymentDate)
        gaps.push(daysBetween(d1, d2))
      }
    }
    return { avg: gaps.length > 0 ? Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length) : null, count: gaps.length }
  }

  const r12 = avgDaysBetweenOrders(0, 1)
  const r23 = avgDaysBetweenOrders(1, 2)
  const r34 = avgDaysBetweenOrders(2, 3)
  const r45 = avgDaysBetweenOrders(3, 4)

  return {
    avgDays1to2: r12.avg,
    avgDays2to3: r23.avg,
    avgDays3to4: r34.avg,
    avgDays4to5: r45.avg,
    customers1to2: r12.count,
    customers2to3: r23.count,
    customers3to4: r34.count,
    customers4to5: r45.count,
  }
}

// ---------------------------------------------------------------------------
// Cohort repurchase analysis
// ---------------------------------------------------------------------------

function buildRepurchaseAnalysis(
  cohorts: CohortData[],
  dataEndDate: Date,
  observationWindow: number
): CohortRepurchaseAnalysis[] {
  return cohorts.map(({ cohort, customers }) => {
    const cohortDate = new Date(cohort + '-01')
    const windowEnd = new Date(cohortDate)
    windowEnd.setMonth(windowEnd.getMonth() + observationWindow)

    const monthsAvailable = Math.min(
      observationWindow,
      Math.max(0, diffMonths(cohortDate, dataEndDate))
    )
    const fullyObserved = monthsAvailable >= observationWindow

    const monthlyRepurchase = Array.from({ length: observationWindow }, (_, i) => {
      if (i >= monthsAvailable) return 0
      const monthStart = new Date(cohortDate)
      monthStart.setMonth(monthStart.getMonth() + i)
      const monthEnd = new Date(cohortDate)
      monthEnd.setMonth(monthEnd.getMonth() + i + 1)

      const repurchased = customers.filter((c) =>
        c.purchases.slice(1).some((p) => {
          const pd = new Date(p.paymentDate)
          return pd >= monthStart && pd < monthEnd
        })
      ).length

      return customers.length > 0 ? (repurchased / customers.length) * 100 : 0
    })

    const customersWithRepurchase6m = customers.filter((c) => {
      const cutoff = new Date(cohortDate)
      cutoff.setMonth(cutoff.getMonth() + 6)
      return c.purchases.slice(1).some((p) => new Date(p.paymentDate) <= cutoff)
    }).length

    const totalRepurchaseRate =
      customers.length > 0
        ? (customers.filter((c) => c.totalOrders >= 2).length / customers.length) * 100
        : 0

    return {
      cohort,
      cohort_size: customers.length,
      total_repurchase_rate: totalRepurchaseRate,
      total_repurchase_rate_6m:
        customers.length > 0 ? (customersWithRepurchase6m / customers.length) * 100 : 0,
      monthly_repurchase: monthlyRepurchase,
      fully_observed: fullyObserved,
      months_observed: monthsAvailable,
      observation_window: observationWindow,
      m1_repurchase: monthlyRepurchase[0] ?? 0,
      m2_repurchase: monthlyRepurchase[1] ?? 0,
      m3_repurchase: monthlyRepurchase[2] ?? 0,
      m4_repurchase: monthlyRepurchase[3] ?? 0,
      m5_repurchase: monthlyRepurchase[4] ?? 0,
      m6_repurchase: monthlyRepurchase[5] ?? 0,
    }
  })
}

// ---------------------------------------------------------------------------
// Product intelligence
// ---------------------------------------------------------------------------

function buildProductIntelligence(customers: Customer[]) {
  // Collect product pairs per order
  const pairCounts = new Map<string, number>()
  const trioCounts = new Map<string, number>()

  for (const c of customers) {
    for (const purchase of c.purchases) {
      const products = (purchase.products ?? []).filter(Boolean)
      if (products.length < 2) continue

      const sorted = [...new Set(products)].sort()
      // Pairs
      for (let i = 0; i < sorted.length; i++) {
        for (let j = i + 1; j < sorted.length; j++) {
          const key = `${sorted[i]}|||${sorted[j]}`
          pairCounts.set(key, (pairCounts.get(key) ?? 0) + 1)
        }
      }
      // Trios
      for (let i = 0; i < sorted.length; i++) {
        for (let j = i + 1; j < sorted.length; j++) {
          for (let k = j + 1; k < sorted.length; k++) {
            const key = `${sorted[i]}|||${sorted[j]}|||${sorted[k]}`
            trioCounts.set(key, (trioCounts.get(key) ?? 0) + 1)
          }
        }
      }
    }
  }

  const product_duos: ProductBundle[] = Array.from(pairCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([key, count]) => ({ products: key.split('|||'), co_occurrence_count: count }))

  const product_trios: ProductBundle[] = Array.from(trioCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([key, count]) => ({ products: key.split('|||'), co_occurrence_count: count }))

  // Ticket drivers
  const allAmounts = customers
    .flatMap((c) => c.purchases)
    .map((p) => p.amount)
  allAmounts.sort((a, b) => a - b)
  const highValueThreshold = allAmounts[Math.floor(allAmounts.length * 0.75)] ?? 0

  const productHighValueCount = new Map<string, number>()
  const productTotalOrders = new Map<string, number>()
  const productTotalValue = new Map<string, number>()

  for (const c of customers) {
    for (const purchase of c.purchases) {
      const isHigh = purchase.amount >= highValueThreshold
      for (const product of purchase.products ?? []) {
        productTotalOrders.set(product, (productTotalOrders.get(product) ?? 0) + 1)
        productTotalValue.set(product, (productTotalValue.get(product) ?? 0) + purchase.amount)
        if (isHigh) {
          productHighValueCount.set(product, (productHighValueCount.get(product) ?? 0) + 1)
        }
      }
    }
  }

  const totalHighValueOrders = customers
    .flatMap((c) => c.purchases)
    .filter((p) => p.amount >= highValueThreshold).length

  const ticket_drivers: TicketDriver[] = Array.from(productTotalOrders.entries())
    .filter(([, total]) => total >= 2)
    .map(([product, total]) => {
      const highCount = productHighValueCount.get(product) ?? 0
      const presenceInHigh = total > 0 ? (highCount / total) * 100 : 0
      const overallHighRate = totalHighValueOrders > 0 ? (totalHighValueOrders / customers.flatMap(c => c.purchases).length) * 100 : 25
      const liftScore = overallHighRate > 0 ? presenceInHigh / overallHighRate : 1
      const avgCartValue = (productTotalValue.get(product) ?? 0) / total
      return { product_name: product, lift_score: liftScore, presence_in_high_value_orders: presenceInHigh, avg_cart_value_when_present: avgCartValue, rank: 0 }
    })
    .sort((a, b) => b.lift_score - a.lift_score)
    .slice(0, 10)
    .map((d, i) => ({ ...d, rank: i + 1 }))

  return { ticket_drivers, product_duos, product_trios, missing_bundle_opportunities: [] as MissingBundleOpportunity[] }
}

// ---------------------------------------------------------------------------
// First purchase products
// ---------------------------------------------------------------------------

function buildFirstPurchaseProducts(customers: Customer[]): FirstPurchaseProduct[] {
  const productCounts = new Map<string, number>()

  for (const c of customers) {
    const firstPurchase = c.purchases[0]
    if (!firstPurchase) continue
    for (const product of firstPurchase.products ?? []) {
      productCounts.set(product, (productCounts.get(product) ?? 0) + 1)
    }
  }

  const totalFirstOrders = customers.filter((c) => c.purchases.length > 0).length

  return Array.from(productCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([product_name, count], i) => ({
      rank: i + 1,
      product_name,
      first_purchase_count: count,
      percentage_of_first_orders: totalFirstOrders > 0 ? (count / totalFirstOrders) * 100 : 0,
    }))
}

// ---------------------------------------------------------------------------
// Next purchase intelligence
// ---------------------------------------------------------------------------

function buildNextPurchaseIntelligence(customers: Customer[]): { top_next_purchases: TopNextPurchase[] } {
  const transitions = new Map<
    string,
    { count: number; totalDays: number; nextProduct: Map<string, number> }
  >()

  for (const c of customers) {
    const sorted = [...c.purchases].sort(
      (a, b) => new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime()
    )
    for (let i = 0; i < sorted.length - 1; i++) {
      const from = sorted[i]
      const to = sorted[i + 1]
      const fromProducts = from.products ?? []
      const toProducts = to.products ?? []
      const days = daysBetween(new Date(from.paymentDate), new Date(to.paymentDate))

      for (const fromProduct of fromProducts) {
        for (const toProduct of toProducts) {
          if (fromProduct === toProduct) continue
          const key = fromProduct
          if (!transitions.has(key)) {
            transitions.set(key, { count: 0, totalDays: 0, nextProduct: new Map() })
          }
          const entry = transitions.get(key)!
          entry.count++
          entry.totalDays += days
          entry.nextProduct.set(toProduct, (entry.nextProduct.get(toProduct) ?? 0) + 1)
        }
      }
    }
  }

  const results: TopNextPurchase[] = []
  for (const [origin, data] of transitions.entries()) {
    if (data.count < 2) continue
    let maxCount = 0
    let mostLikely = ''
    for (const [prod, count] of data.nextProduct.entries()) {
      if (count > maxCount) { maxCount = count; mostLikely = prod }
    }
    results.push({
      origin_product: origin,
      most_likely_next_product: mostLikely,
      probability: data.count > 0 ? maxCount / data.count : 0,
      transition_count: data.count,
      avg_days_between_orders: data.count > 0 ? Math.round(data.totalDays / data.count) : 0,
    })
  }

  return {
    top_next_purchases: results.sort((a, b) => b.transition_count - a.transition_count).slice(0, 20),
  }
}

// ---------------------------------------------------------------------------
// Main processing function
// ---------------------------------------------------------------------------

export function processExcelData(
  rawData: Record<string, unknown>[],
  options: { observationWindow: number } = { observationWindow: 12 }
): { analysis: CohortAnalysis | null; errors: string[] } {
  const errors: string[] = []

  if (!rawData || rawData.length === 0) {
    return { analysis: null, errors: ['El archivo está vacío'] }
  }

  const { emailKey, dateKey, amountKey, productKey } = resolveKeys(rawData)

  if (!emailKey) {
    errors.push('No se encontró columna de email. Columnas esperadas: email, correo, customer_email')
  }
  if (!dateKey) {
    errors.push('No se encontró columna de fecha. Columnas esperadas: created_at, fecha, date, order_date')
  }
  if (!amountKey) {
    errors.push('No se encontró columna de monto. Columnas esperadas: total, amount, precio, subtotal')
  }

  if (!emailKey || !dateKey || !amountKey) {
    return { analysis: null, errors }
  }

  // Group rows by customer email
  const customerMap = new Map<string, Array<{ date: Date; amount: number; products: string[] }>>()

  for (const row of rawData) {
    const email = String(row[emailKey] ?? '').trim().toLowerCase()
    if (!email || !email.includes('@')) continue

    const date = parseDate(row[dateKey])
    if (!date) continue

    const amount = parseAmount(row[amountKey])
    if (amount <= 0) continue

    const product = productKey ? String(row[productKey] ?? '').trim() : ''
    const products = product ? [product] : []

    if (!customerMap.has(email)) customerMap.set(email, [])
    customerMap.get(email)!.push({ date, amount, products })
  }

  if (customerMap.size === 0) {
    return { analysis: null, errors: ['No se encontraron datos de clientes válidos'] }
  }

  const now = new Date()
  const allDates: Date[] = []

  // Build customers
  const customers: Customer[] = Array.from(customerMap.entries()).map(([email, orders]) => {
    const sorted = orders.sort((a, b) => a.date.getTime() - b.date.getTime())
    const firstPurchaseDate = sorted[0].date
    const cohort = toCohortKey(firstPurchaseDate)
    allDates.push(...sorted.map((o) => o.date))

    const purchases: Purchase[] = sorted.map((o) => ({
      paymentDate: o.date,
      amount: o.amount,
      products: o.products,
    }))

    const customer: Customer = {
      email,
      cohort,
      totalOrders: sorted.length,
      purchases,
      firstPurchaseDate,
      rfm_segment: '',
      momentum_segment: '',
      status: '',
      subSegment: '',
    }

    customer.rfm_segment = assignRFMSegment(customer, now)
    customer.momentum_segment = assignMomentumSegment(customer)
    const health = assignHealthStatus(customer, now)
    customer.status = health.status
    customer.subSegment = health.subSegment

    return customer
  })

  if (customers.length === 0) {
    return { analysis: null, errors: ['No se pudieron procesar clientes'] }
  }

  // Build cohort groups
  const cohortMap = new Map<string, Customer[]>()
  for (const c of customers) {
    if (!cohortMap.has(c.cohort)) cohortMap.set(c.cohort, [])
    cohortMap.get(c.cohort)!.push(c)
  }

  const cohorts: CohortData[] = Array.from(cohortMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([cohort, cohortCustomers]) => ({
      cohort,
      customers: cohortCustomers,
      totalCustomers: cohortCustomers.length,
    }))

  const startDate = new Date(Math.min(...allDates.map((d) => d.getTime())))
  const endDate = new Date(Math.max(...allDates.map((d) => d.getTime())))
  const dataEndDate = endDate

  const observationWindow = options.observationWindow ?? 12

  const repurchaseAnalysis = buildRepurchaseAnalysis(cohorts, dataEndDate, observationWindow)

  // Peak repurchase month
  const fullyObserved = repurchaseAnalysis.filter((c) => c.fully_observed)
  const monthlyAvgs = Array.from({ length: observationWindow }, (_, i) => {
    if (fullyObserved.length === 0) return 0
    return fullyObserved.reduce((sum, c) => sum + (c.monthly_repurchase[i] ?? 0), 0) / fullyObserved.length
  })
  const peakMonthIndex = monthlyAvgs.indexOf(Math.max(...monthlyAvgs))
  const peakRepurchaseMonth = peakMonthIndex >= 0 ? peakMonthIndex + 1 : 0
  const peakRepurchaseRate = monthlyAvgs[peakMonthIndex] ?? 0

  const globalRepurchaseRate =
    customers.length > 0
      ? (customers.filter((c) => c.totalOrders >= 2).length / customers.length) * 100
      : 0

  const totalOrders = customers.reduce((sum, c) => sum + c.totalOrders, 0)

  const revenueMetrics = buildRevenueMetrics(customers, now)
  const orderMetrics = buildOrderMetrics(customers)
  const recencyMetrics = buildRecencyMetrics(customers)
  const rfmSegments = buildRFMSegments(customers)
  const productIntelligence = buildProductIntelligence(customers)
  const nextPurchaseIntelligence = buildNextPurchaseIntelligence(customers)
  const firstPurchaseProducts = buildFirstPurchaseProducts(customers)

  const analysis: CohortAnalysis = {
    customers,
    cohorts,
    repurchaseAnalysis,
    totalCustomers: customers.length,
    totalOrders,
    globalRepurchaseRate,
    peakRepurchaseMonth,
    peakRepurchaseRate,
    peakRepurchaseMonthIndex: peakMonthIndex,
    startDate,
    endDate,
    dataEndDate,
    observationWindow,
    revenueMetrics,
    orderMetrics,
    recencyMetrics,
    rfmAnalysis: { segments: rfmSegments },
    productIntelligence,
    nextPurchaseIntelligence,
    firstPurchaseProducts,
  }

  return { analysis, errors }
}
