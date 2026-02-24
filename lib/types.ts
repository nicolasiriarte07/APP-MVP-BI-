export interface Purchase {
  paymentDate: Date | string
  amount: number
  products?: string[]
  orderId?: string
}

export interface Customer {
  email: string
  cohort: string
  totalOrders: number
  purchases: Purchase[]
  firstPurchaseDate: Date
  rfm_segment: string
  momentum_segment: string
  status: string
  subSegment: string
}

export interface CohortData {
  cohort: string
  customers: Customer[]
  totalCustomers: number
}

export interface CohortRepurchaseAnalysis {
  cohort: string
  cohort_size: number
  total_repurchase_rate: number
  total_repurchase_rate_6m: number
  monthly_repurchase: number[]
  fully_observed: boolean
  months_observed: number
  observation_window: number
  m1_repurchase: number
  m2_repurchase: number
  m3_repurchase: number
  m4_repurchase: number
  m5_repurchase: number
  m6_repurchase: number
}

export interface SegmentSummary {
  segment: string
  customer_count: number
  percentage_of_customers: number
  total_revenue: number
  revenue_share: number
  avg_revenue_per_customer: number
}

export interface CohortRevMetric {
  cohort: string
  ltv1m: number
  ltv3m: number
  ltv6m: number
  ltv12m: number
  revenueByMonth: number[]
  firstPurchaseRevenue: number
  repurchaseRevenue: number
  repurchasePercent: number
}

export interface RevenueMetrics {
  totalRevenue: number
  avgLtv1m: number
  avgLtv3m: number
  avgLtv6m: number
  avgLtv12m: number
  totalFirstPurchaseRevenue: number
  totalRepurchaseRevenue: number
  firstPurchasePercent: number
  repurchasePercent: number
  avgRevenue1m: number
  avgRevenue2m: number
  avgRevenue3m: number
  avgRevenue4m: number
  avgRevenue5m: number
  avgRevenue6m: number
  cohortMetrics: CohortRevMetric[]
}

export interface PurchaseOrderMetrics {
  aov1: number
  aov2: number
  aov3: number
  aov4: number
  aov5: number
  customers1: number
  customers2: number
  customers3: number
  customers4: number
  customers5: number
  retention1to2: number
  retention2to3: number
  retention3to4: number
  retention4to5: number
  dropoff1to2: number
  dropoff2to3: number
  dropoff3to4: number
  dropoff4to5: number
}

export interface RecencyMetrics {
  avgDays1to2: number | null
  avgDays2to3: number | null
  avgDays3to4: number | null
  avgDays4to5: number | null
  customers1to2: number
  customers2to3: number
  customers3to4: number
  customers4to5: number
}

export interface ProductBundle {
  products: string[]
  co_occurrence_count: number
}

export interface TicketDriver {
  rank: number
  product_name: string
  lift_score: number
  presence_in_high_value_orders: number
  avg_cart_value_when_present: number
}

export interface FirstPurchaseProduct {
  rank: number
  product_name: string
  first_purchase_count: number
  percentage_of_first_orders: number
}

export interface TopNextPurchase {
  origin_product: string
  most_likely_next_product: string
  probability: number
  transition_count: number
  avg_days_between_orders: number
}

export interface MissingBundleOpportunity {
  products: string[]
  why_its_happening: string
  co_purchase_frequency: number
  avg_order_value: number
  estimated_revenue_upside: number
  recommended_actions: string[]
}

export interface GrowthOpportunity {
  type: string
  title: string
  description: string
  impact: string
  customers: number
  estimatedRevenue: number
}

export interface CohortAnalysis {
  customers: Customer[]
  cohorts: CohortData[]
  repurchaseAnalysis: CohortRepurchaseAnalysis[]
  totalCustomers: number
  totalOrders: number
  globalRepurchaseRate: number
  peakRepurchaseMonth: number
  peakRepurchaseRate: number
  peakRepurchaseMonthIndex: number
  startDate: Date
  endDate: Date
  dataEndDate: Date
  observationWindow: number
  revenueMetrics: RevenueMetrics
  orderMetrics: PurchaseOrderMetrics
  recencyMetrics: RecencyMetrics
  rfmAnalysis: {
    segments: SegmentSummary[]
  }
  productIntelligence: {
    ticket_drivers: TicketDriver[]
    product_duos: ProductBundle[]
    product_trios: ProductBundle[]
    missing_bundle_opportunities: MissingBundleOpportunity[]
  }
  nextPurchaseIntelligence: {
    top_next_purchases: TopNextPurchase[]
  }
  firstPurchaseProducts: FirstPurchaseProduct[]
  selectedIndustry?: string
}

// Legacy alias kept for backwards-compat with cohort-data-display
export type { CohortRepurchaseAnalysis as CohortRepurchaseAnalysisType }

export interface ExecutiveNarrative {
  thirtyDay: {
    revenueChangePercent: number
    previous30DaysRevenue: number
    current30DaysRevenue: number
    primaryCause: string
    secondaryCauses: Array<{ cause: string; impact: number }>
    projection90Days: number
  }
  criticalAlert: {
    atRiskPercentage: number
    totalAtRiskRevenue: number
    customerAtRisk: {
      count: number
      revenue: number
    }
  }
  topPriority: {
    actionName: string
    customerCount: number
    valueAtStake: number
    description: string
    timing: string
    expectedRoi: number
  }
  executiveSummary: {
    avgLTV: number
    repeatRevenuePercent: number
    retention1to2: number
    bottleneckImplication: string
  }
  keyMetrics: Array<{
    title: string
    metric: number
    metricLabel: string
    meaning: string
    implication: string
  }>
  otherActions: Array<{
    action: string
    customerCount: number
    estimatedImpact: number
    timing: string
    effort: string
  }>
}
