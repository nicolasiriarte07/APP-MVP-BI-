import type { CohortAnalysis, ExecutiveNarrative } from './types'

export type { ExecutiveNarrative }

export function generateExecutiveNarrative(analysis: CohortAnalysis): ExecutiveNarrative {
  const now = new Date()

  // --- 30-day revenue comparison ---
  const thirtyDaysAgo = new Date(now)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const sixtyDaysAgo = new Date(now)
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)

  let current30DaysRevenue = 0
  let previous30DaysRevenue = 0

  for (const customer of analysis.customers) {
    for (const purchase of customer.purchases) {
      const pd = new Date(purchase.paymentDate)
      if (pd >= thirtyDaysAgo && pd <= now) {
        current30DaysRevenue += purchase.amount
      } else if (pd >= sixtyDaysAgo && pd < thirtyDaysAgo) {
        previous30DaysRevenue += purchase.amount
      }
    }
  }

  const revenueChangePercent =
    previous30DaysRevenue > 0
      ? ((current30DaysRevenue - previous30DaysRevenue) / previous30DaysRevenue) * 100
      : 0

  const primaryCause =
    revenueChangePercent >= 0
      ? `Mayor actividad de recompra en el período (+${analysis.globalRepurchaseRate.toFixed(1)}% tasa global de recompra).`
      : `Reducción en frecuencia de compra. Tasa de retención 1ra-2da compra: ${analysis.orderMetrics.retention1to2.toFixed(1)}%.`

  const secondaryCauses: Array<{ cause: string; impact: number }> = []
  const atRiskSeg = analysis.rfmAnalysis.segments.find((s) => s.segment === 'At Risk')
  if (atRiskSeg && atRiskSeg.customer_count > 0) {
    secondaryCauses.push({
      cause: `${atRiskSeg.customer_count} clientes en riesgo de churn`,
      impact: -atRiskSeg.total_revenue * 0.3,
    })
  }
  const loyalSeg = analysis.rfmAnalysis.segments.find((s) => s.segment === 'Loyal')
  if (loyalSeg && loyalSeg.customer_count > 0) {
    secondaryCauses.push({
      cause: `${loyalSeg.customer_count} clientes leales generando valor recurrente`,
      impact: loyalSeg.total_revenue * 0.1,
    })
  }

  const projection90Days = current30DaysRevenue * 3 * (1 + revenueChangePercent / 200)

  // --- Critical alert ---
  const totalRevenue = analysis.customers.reduce(
    (sum, c) => sum + c.purchases.reduce((s, p) => s + p.amount, 0),
    0
  )

  const atRiskRevenue = atRiskSeg?.total_revenue ?? 0
  const slowingRevenue = analysis.customers
    .filter((c) => c.momentum_segment === 'Slowing')
    .reduce((sum, c) => sum + c.purchases.reduce((s, p) => s + p.amount, 0), 0)
  const totalAtRiskRevenue = atRiskRevenue + slowingRevenue
  const atRiskPercentage = totalRevenue > 0 ? (totalAtRiskRevenue / totalRevenue) * 100 : 0

  // --- Top priority ---
  let topPriorityActionName = 'Reactivar clientes en riesgo'
  let topPriorityCustomerCount = atRiskSeg?.customer_count ?? 0
  let topPriorityValue = totalAtRiskRevenue
  let topPriorityDescription =
    'Envía campaña personalizada de win-back con oferta exclusiva en los próximos 7 días.'
  let topPriorityTiming = 'Esta semana'
  let topPriorityRoi = totalAtRiskRevenue * 0.15

  if (analysis.orderMetrics.retention1to2 < 20) {
    topPriorityActionName = 'Mejorar conversión a segunda compra'
    topPriorityCustomerCount = analysis.customers.filter((c) => c.totalOrders === 1).length
    topPriorityValue =
      topPriorityCustomerCount * analysis.orderMetrics.aov2 * (analysis.orderMetrics.retention1to2 / 100)
    topPriorityDescription =
      'Campaña post-compra en los primeros 30 días para capturar ventana óptima de recompra.'
    topPriorityRoi = topPriorityCustomerCount * analysis.orderMetrics.aov2 * 0.05
  }

  // --- Executive summary ---
  const avgLTV = analysis.revenueMetrics.avgLtv6m
  const repeatRevenuePercent = analysis.revenueMetrics.repurchasePercent
  const retention1to2 = analysis.orderMetrics.retention1to2
  const bottleneckImplication =
    retention1to2 < 25
      ? `La conversión de 1ra a 2da compra (${retention1to2.toFixed(1)}%) es el principal cuello de botella. Mejorarla en 5pp puede generar +${(analysis.customers.length * analysis.orderMetrics.aov2 * 0.05).toFixed(0)} USD.`
      : `Base estable. Enfócate en escalar el segmento leal (${loyalSeg?.customer_count ?? 0} clientes, ${loyalSeg?.revenue_share.toFixed(1) ?? 0}% del revenue).`

  // --- Key metrics ---
  const keyMetrics = [
    {
      title: 'LTV Promedio 6M',
      metric: analysis.revenueMetrics.avgLtv6m,
      metricLabel: 'USD',
      meaning: 'Valor promedio generado por cliente en sus primeros 6 meses.',
      implication:
        analysis.revenueMetrics.avgLtv6m > 200
          ? 'CAC máximo recomendado: $' + (analysis.revenueMetrics.avgLtv6m * 0.3).toFixed(0)
          : 'Optimiza retención para aumentar LTV antes de escalar adquisición.',
    },
    {
      title: 'Tasa de Recompra Global',
      metric: analysis.globalRepurchaseRate,
      metricLabel: '%',
      meaning: 'Porcentaje de clientes que realizan al menos 2 compras.',
      implication:
        analysis.globalRepurchaseRate > 30
          ? 'Buen indicador. Enfócate en aumentar frecuencia de los compradores recurrentes.'
          : 'Por debajo del óptimo. Prioriza campañas de segunda compra.',
    },
    {
      title: 'Retención 1ra→2da Compra',
      metric: analysis.orderMetrics.retention1to2,
      metricLabel: '%',
      meaning: 'De cada 100 compradores nuevos, cuántos hacen una segunda compra.',
      implication:
        analysis.orderMetrics.retention1to2 < 20
          ? 'Crítico: menos de 1 de cada 5 regresa. Acción inmediata requerida.'
          : 'Aceptable. Optimiza el timing de reactivación alrededor del mes ' + analysis.peakRepurchaseMonth + '.',
    },
  ]

  // --- Other actions ---
  const otherActions = [
    {
      action: 'Campaña de segunda compra para nuevos clientes',
      customerCount: analysis.customers.filter((c) => c.totalOrders === 1).length,
      estimatedImpact:
        analysis.customers.filter((c) => c.totalOrders === 1).length *
        analysis.orderMetrics.aov2 *
        0.05,
      timing: `Mes ${analysis.peakRepurchaseMonth} post primera compra`,
      effort: 'bajo',
    },
    {
      action: 'Retención clientes leales con programa de rewards',
      customerCount: loyalSeg?.customer_count ?? 0,
      estimatedImpact: (loyalSeg?.total_revenue ?? 0) * 0.1,
      timing: 'Continuo',
      effort: 'medio',
    },
    {
      action: 'Win-back para segmento en riesgo',
      customerCount: atRiskSeg?.customer_count ?? 0,
      estimatedImpact: atRiskRevenue * 0.15,
      timing: 'Próximas 2 semanas',
      effort: 'bajo',
    },
  ].filter((a) => a.customerCount > 0)

  return {
    thirtyDay: {
      revenueChangePercent,
      previous30DaysRevenue,
      current30DaysRevenue,
      primaryCause,
      secondaryCauses,
      projection90Days,
    },
    criticalAlert: {
      atRiskPercentage,
      totalAtRiskRevenue,
      customerAtRisk: {
        count: (atRiskSeg?.customer_count ?? 0) + analysis.customers.filter((c) => c.momentum_segment === 'Slowing').length,
        revenue: totalAtRiskRevenue,
      },
    },
    topPriority: {
      actionName: topPriorityActionName,
      customerCount: topPriorityCustomerCount,
      valueAtStake: topPriorityValue,
      description: topPriorityDescription,
      timing: topPriorityTiming,
      expectedRoi: topPriorityRoi,
    },
    executiveSummary: {
      avgLTV,
      repeatRevenuePercent,
      retention1to2,
      bottleneckImplication,
    },
    keyMetrics,
    otherActions,
  }
}
