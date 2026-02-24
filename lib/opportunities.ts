import type { CohortAnalysis, GrowthOpportunity } from './types'

export function detectGrowthOpportunities(analysis: CohortAnalysis): GrowthOpportunity[] {
  const opportunities: GrowthOpportunity[] = []

  const totalRevenue = analysis.customers.reduce(
    (sum, c) => sum + c.purchases.reduce((s, p) => s + p.amount, 0),
    0
  )

  // Opportunity: improve 1-to-2 repurchase
  const retention1to2 = analysis.orderMetrics.retention1to2
  if (retention1to2 < 30) {
    const customersWithOneOrder = analysis.customers.filter((c) => c.totalOrders === 1).length
    const potentialRevenue = customersWithOneOrder * analysis.orderMetrics.aov2 * 0.1
    opportunities.push({
      type: 'retention',
      title: 'Mejorar Segunda Compra',
      description: `Solo el ${retention1to2.toFixed(1)}% de clientes hacen una segunda compra. Campaña de reactivación puede aumentar ingresos.`,
      impact: 'Alto',
      customers: customersWithOneOrder,
      estimatedRevenue: potentialRevenue,
    })
  }

  // Opportunity: at-risk segment
  const atRiskSegment = analysis.rfmAnalysis.segments.find((s) => s.segment === 'At Risk')
  if (atRiskSegment && atRiskSegment.customer_count > 0) {
    opportunities.push({
      type: 'winback',
      title: 'Recuperar Clientes en Riesgo',
      description: `${atRiskSegment.customer_count} clientes en riesgo con $${atRiskSegment.total_revenue.toFixed(0)} en revenue histórico.`,
      impact: atRiskSegment.percentage_of_customers > 20 ? 'Crítico' : 'Alto',
      customers: atRiskSegment.customer_count,
      estimatedRevenue: atRiskSegment.total_revenue * 0.2,
    })
  }

  // Opportunity: low LTV growth
  const ltvGrowth6to12 =
    analysis.revenueMetrics.avgLtv6m > 0
      ? ((analysis.revenueMetrics.avgLtv12m - analysis.revenueMetrics.avgLtv6m) /
          analysis.revenueMetrics.avgLtv6m) *
        100
      : 0

  if (ltvGrowth6to12 < 20) {
    opportunities.push({
      type: 'ltv',
      title: 'Aumentar LTV a Largo Plazo',
      description: `El LTV crece solo ${ltvGrowth6to12.toFixed(1)}% entre M6 y M12. Programa de lealtad puede mejorar retención tardía.`,
      impact: 'Medio',
      customers: analysis.customers.filter((c) => c.totalOrders >= 2).length,
      estimatedRevenue: totalRevenue * 0.05,
    })
  }

  // Opportunity: product bundles
  if (analysis.productIntelligence.product_duos.length > 0) {
    const topDuo = analysis.productIntelligence.product_duos[0]
    opportunities.push({
      type: 'bundle',
      title: 'Bundle de Productos',
      description: `Los productos "${topDuo.products.join('" y "')}" se compran juntos ${topDuo.co_occurrence_count} veces. Crear bundle oficial puede aumentar AOV.`,
      impact: 'Medio',
      customers: topDuo.co_occurrence_count,
      estimatedRevenue: topDuo.co_occurrence_count * analysis.orderMetrics.aov1 * 0.15,
    })
  }

  return opportunities
}
