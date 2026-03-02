import type { Customer } from './types'

function escapeCSV(value: string | number): string {
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function customersToCSV(customers: Customer[], exportDate: Date): string {
  const headers = [
    'Email',
    'Cohort',
    'RFM Segment',
    'Momentum',
    'Status',
    'Sub Segment',
    'Total Orders',
    'First Purchase Date',
    'Last Purchase Date',
    'Total Revenue',
    'Avg Order Value',
    'Days Since Last Purchase',
  ]

  const rows = customers.map((c) => {
    const lastPurchase = c.purchases[c.purchases.length - 1]
    const lastDate = lastPurchase ? new Date(lastPurchase.paymentDate) : new Date(c.firstPurchaseDate)
    const totalRevenue = c.purchases.reduce((sum, p) => sum + p.amount, 0)
    const avgOrderValue = c.totalOrders > 0 ? totalRevenue / c.totalOrders : 0
    const daysSinceLastPurchase = Math.round(
      (exportDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
    )

    return [
      escapeCSV(c.email),
      escapeCSV(c.cohort),
      escapeCSV(c.rfm_segment),
      escapeCSV(c.momentum_segment),
      escapeCSV(c.status),
      escapeCSV(c.subSegment),
      escapeCSV(c.totalOrders),
      escapeCSV(new Date(c.firstPurchaseDate).toISOString().split('T')[0]),
      escapeCSV(lastDate.toISOString().split('T')[0]),
      escapeCSV(totalRevenue.toFixed(2)),
      escapeCSV(avgOrderValue.toFixed(2)),
      escapeCSV(daysSinceLastPurchase),
    ].join(',')
  })

  return [headers.join(','), ...rows].join('\n')
}

export function generateRFMExports(
  customers: Customer[],
  exportDate: Date
): Record<string, { csv: string }> {
  const segments = ['Loyal', 'Potential', 'At Risk', 'Lost']
  const result: Record<string, { csv: string }> = {}

  for (const segment of segments) {
    const segmentCustomers = customers.filter((c) => c.rfm_segment === segment)
    const key = `rfm_${segment.toLowerCase().replace(/\s+/g, '_')}`
    result[key] = { csv: customersToCSV(segmentCustomers, exportDate) }
  }

  // Momentum segments
  const momentumSegments = ['Accelerating', 'Stable', 'Slowing']
  for (const momentum of momentumSegments) {
    const momentumCustomers = customers.filter((c) => c.momentum_segment === momentum)
    const key = `rfm_${momentum.toLowerCase()}`
    result[key] = { csv: customersToCSV(momentumCustomers, exportDate) }
  }

  // All customers
  result['rfm_all'] = { csv: customersToCSV(customers, exportDate) }

  return result
}
