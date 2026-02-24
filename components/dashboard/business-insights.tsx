'use client'

import React from "react"

import type { CohortAnalysis, CohortRepurchaseAnalysis } from '@/lib/types'
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Target, 
  Users, 
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Lightbulb,
  Calendar
} from 'lucide-react'

interface BusinessInsightsProps {
  analysis: CohortAnalysis
}

interface Insight {
  type: 'success' | 'warning' | 'info' | 'action'
  title: string
  description: string
  metric?: string
  icon: React.ReactNode
}

function generateInsights(analysis: CohortAnalysis): {
  headline: string
  subheadline: string
  insights: Insight[]
  recommendations: string[]
} {
  const { repurchaseAnalysis, observationWindow, customers } = analysis
  const windowMonths = observationWindow || 6
  
  // Calcular % de clientes con 2+ compras
  const customersWithRepurchase = customers.filter(c => c.totalOrders >= 2).length
  const totalCustomers = customers.length
  const repurchasePercentage = totalCustomers > 0 ? (customersWithRepurchase / totalCustomers) * 100 : 0
  
  // Filtrar a cohortes completamente observados para comparaciones precisas
  const fullyObserved = repurchaseAnalysis.filter(c => c.fully_observed)
  const partialCohorts = repurchaseAnalysis.filter(c => !c.fully_observed)
  
  // Calcular tasa promedio de recompra (solo completamente observados)
  const avgRepurchaseRate = fullyObserved.length > 0
    ? fullyObserved.reduce((sum, c) => sum + c.total_repurchase_rate, 0) / fullyObserved.length
    : 0
  
  // Encontrar mes pico de recompra
  const monthRates = Array.from({ length: windowMonths }, (_, i) => {
    const rates = fullyObserved.map(c => c.monthly_repurchase[i] || 0).filter(r => r > 0)
    return {
      month: i + 1,
      avgRate: rates.length > 0 ? rates.reduce((a, b) => a + b, 0) / rates.length : 0
    }
  })
  
  const peakMonth = monthRates.reduce((max, m) => m.avgRate > max.avgRate ? m : max, monthRates[0])
  
  // Encontrar cohortes con mejor y peor rendimiento
  const sortedByRate = [...fullyObserved].sort((a, b) => b.total_repurchase_rate - a.total_repurchase_rate)
  const bestCohort = sortedByRate[0]
  const worstCohort = sortedByRate[sortedByRate.length - 1]
  
  // Analizar tendencias (comparar primera mitad vs segunda mitad de cohortes)
  const midPoint = Math.floor(fullyObserved.length / 2)
  const earlyCohorts = fullyObserved.slice(0, midPoint)
  const recentCohorts = fullyObserved.slice(midPoint)
  
  const earlyAvg = earlyCohorts.length > 0
    ? earlyCohorts.reduce((sum, c) => sum + c.total_repurchase_rate, 0) / earlyCohorts.length
    : 0
  const recentAvg = recentCohorts.length > 0
    ? recentCohorts.reduce((sum, c) => sum + c.total_repurchase_rate, 0) / recentCohorts.length
    : 0
  
  const trendDirection = recentAvg > earlyAvg ? 'improving' : recentAvg < earlyAvg ? 'declining' : 'stable'
  const trendDifference = Math.abs(recentAvg - earlyAvg)
  
  // Calcular comportamiento de recompra temprana vs tardia
  const earlyMonthsAvg = monthRates.slice(0, 2).reduce((sum, m) => sum + m.avgRate, 0) / 2
  const lateMonthsAvg = monthRates.slice(-2).reduce((sum, m) => sum + m.avgRate, 0) / 2
  
  // Formatear nombre de cohorte para mostrar
  const formatCohort = (cohort: string) => {
    const [year, month] = cohort.split('-')
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    return `${monthNames[parseInt(month) - 1]} ${year}`
  }
  
  // Construir array de insights
  const insights: Insight[] = []
  
  // Calculate revenue at risk (from at-risk and slowing customers)
  const totalRevenue = analysis.customers.reduce((sum, customer) => {
    return sum + customer.purchases.reduce((custSum, purchase) => custSum + purchase.amount, 0)
  }, 0)
  
  const atRiskSegment = analysis.rfmAnalysis.segments.find(s => s.segment === 'At Risk')
  const slowingMomentum = analysis.customers
    .filter(c => c.momentum_segment === 'Slowing')
    .reduce((sum, customer) => {
      return sum + customer.purchases.reduce((custSum, purchase) => custSum + purchase.amount, 0)
    }, 0)
  
  const totalAtRiskRevenue = (atRiskSegment?.total_revenue || 0) + slowingMomentum
  const atRiskRevenuePercentage = totalRevenue > 0 ? (totalAtRiskRevenue / totalRevenue) * 100 : 0
  
  // INSIGHT 0 (FIRST PRIORITY): Revenue at Risk
  if (totalAtRiskRevenue > 0 && atRiskRevenuePercentage > 5) {
    insights.push({
      type: 'warning',
      title: '⚠️ Revenue at Risk',
      description: `${(totalAtRiskRevenue / 1).toFixed(0)} USD in future billing could be lost if at-risk customers churn.`,
      metric: `${atRiskRevenuePercentage.toFixed(1)}%`,
      icon: <AlertTriangle className="h-5 w-5" />
    })
  }

  // INSIGHT 1 (PRIORITY): 12-Month Customer Return Rate
  const twelveMonthCohorts = analysis.repurchaseAnalysis.filter(c => c.observation_window >= 12 || c.monthly_repurchase.length >= 12)
  const twelveMonthRepurchaseRate = twelveMonthCohorts.length > 0 
    ? twelveMonthCohorts.reduce((sum, c) => sum + c.total_repurchase_rate, 0) / twelveMonthCohorts.length
    : analysis.globalRepurchaseRate

  if (twelveMonthRepurchaseRate > 0) {
    insights.push({
      type: 'success',
      title: 'Clientes que Regresan en 12 Meses',
      description: `${twelveMonthRepurchaseRate.toFixed(1)}% de tu base de clientes realiza otra compra dentro de su primer año.`,
      metric: `${twelveMonthRepurchaseRate.toFixed(1)}%`,
      icon: <TrendingUp className="h-5 w-5" />
    })
  }
  
  
  // Insight 1: Evaluacion general de tasa de recompra
  if (avgRepurchaseRate >= 20) {
    insights.push({
      type: 'success',
      title: 'Fuerte Lealtad del Cliente',
      description: `En promedio, ${avgRepurchaseRate.toFixed(1)}% de los clientes realizan una compra repetida dentro de ${windowMonths} meses. Esto indica un solido ajuste producto-mercado y satisfaccion del cliente.`,
      metric: `${avgRepurchaseRate.toFixed(1)}%`,
      icon: <CheckCircle2 className="h-5 w-5" />
    })
  } else if (avgRepurchaseRate >= 10) {
    insights.push({
      type: 'info',
      title: 'Rendimiento de Retencion Moderado',
      description: `Tu tasa de recompra de ${windowMonths} meses del ${avgRepurchaseRate.toFixed(1)}% muestra espacio para mejora. Campanas de retencion dirigidas podrian impactar significativamente los ingresos.`,
      metric: `${avgRepurchaseRate.toFixed(1)}%`,
      icon: <Target className="h-5 w-5" />
    })
  } else {
    insights.push({
      type: 'warning',
      title: 'Oportunidad de Retencion',
      description: `Solo el ${avgRepurchaseRate.toFixed(1)}% de los clientes regresan dentro de ${windowMonths} meses. Esto representa una oportunidad significativa para mejorar el valor de vida del cliente a traves de iniciativas de retencion.`,
      metric: `${avgRepurchaseRate.toFixed(1)}%`,
      icon: <AlertTriangle className="h-5 w-5" />
    })
  }
  
  // Insight 2: Momento pico de recompra
  insights.push({
    type: 'action',
    title: `El Mes ${peakMonth.month} es Tu Ventana de Oportunidad`,
    description: `La actividad de recompra alcanza su pico ${peakMonth.month} mes${peakMonth.month > 1 ? 'es' : ''} despues de la primera compra, con una tasa promedio del ${peakMonth.avgRate.toFixed(1)}%. Este es el momento optimo para campanas de re-engagement.`,
    metric: `M${peakMonth.month}`,
    icon: <Clock className="h-5 w-5" />
  })
  
  // Insight 3: Analisis de tendencias
  if (trendDirection === 'improving' && trendDifference > 1) {
    insights.push({
      type: 'success',
      title: 'Tendencia Positiva de Retencion',
      description: `Los cohortes recientes muestran ${trendDifference.toFixed(1)} puntos porcentuales mas altos en tasas de recompra comparados con cohortes anteriores. Tus esfuerzos de retencion parecen estar funcionando.`,
      metric: `+${trendDifference.toFixed(1)}pp`,
      icon: <TrendingUp className="h-5 w-5" />
    })
  } else if (trendDirection === 'declining' && trendDifference > 1) {
    insights.push({
      type: 'warning',
      title: 'Tendencia de Retencion en Declive',
      description: `Los cohortes recientes muestran ${trendDifference.toFixed(1)} puntos porcentuales menores en tasas de recompra que los cohortes anteriores. Esto amerita investigacion sobre factores de producto, precio o competencia.`,
      metric: `-${trendDifference.toFixed(1)}pp`,
      icon: <TrendingDown className="h-5 w-5" />
    })
  } else {
    insights.push({
      type: 'info',
      title: 'Patron de Retencion Estable',
      description: 'Las tasas de recompra se han mantenido consistentes a traves de los cohortes. Considera probar nuevas estrategias de retencion para mover la aguja.',
      metric: 'Estable',
      icon: <Target className="h-5 w-5" />
    })
  }
  
  // Insight 4: Comportamiento de recompra temprana vs tardia
  if (earlyMonthsAvg > lateMonthsAvg * 1.5) {
    insights.push({
      type: 'info',
      title: 'El Engagement Temprano es Critico',
      description: `La mayoria de las recompras ocurren en los primeros 2 meses (${earlyMonthsAvg.toFixed(1)}% prom) comparado con los ultimos 2 meses (${lateMonthsAvg.toFixed(1)}% prom). Enfoca tu presupuesto de retencion en puntos de contacto tempranos.`,
      icon: <Calendar className="h-5 w-5" />
    })
  }
  
  // Insight 5: Cohorte con mejor rendimiento
  if (bestCohort && worstCohort && bestCohort.total_repurchase_rate > worstCohort.total_repurchase_rate * 1.3) {
    insights.push({
      type: 'info',
      title: 'El Rendimiento de Cohortes Varia',
      description: `Los clientes de ${formatCohort(bestCohort.cohort)} mostraron ${bestCohort.total_repurchase_rate.toFixed(1)}% de tasa de recompra vs ${worstCohort.total_repurchase_rate.toFixed(1)}% para ${formatCohort(worstCohort.cohort)}. Analiza que impulso la diferencia.`,
      icon: <Users className="h-5 w-5" />
    })
  }
  
  // Generar recomendaciones
  const recommendations: string[] = []
  
  // Recomendacion basada en timing
  recommendations.push(
    `Programa campanas de email automatizadas para ${peakMonth.month * 30} dias despues de la primera compra para capturar la ventana pico de recompra.`
  )
  
  // Basada en tasa general
  if (avgRepurchaseRate < 15) {
    recommendations.push(
      'Considera implementar un programa de lealtad o secuencia de seguimiento post-compra para mejorar la conversion de primera a segunda compra.'
    )
  }
  
  // Basada en tendencia
  if (trendDirection === 'declining') {
    recommendations.push(
      'Revisa cambios recientes en producto, precios o experiencia del cliente que puedan estar impactando la retencion.'
    )
  }
  
  // Engagement temprano
  if (monthRates[0] && monthRates[0].avgRate < 5) {
    recommendations.push(
      'El primer mes muestra baja actividad. Prueba una oferta de "bienvenido de vuelta" 2-3 semanas despues de la primera compra.'
    )
  }
  
  // Engagement en etapa tardia
  if (lateMonthsAvg < 3) {
    recommendations.push(
      `Los clientes que no recompran para el mes ${Math.floor(windowMonths / 2)} raramente regresan. Considera una campana de "recuperacion" con incentivos mas fuertes en la marca de ${Math.floor(windowMonths / 2) * 30} dias.`
    )
  }
  
  // Insight de cohortes parciales
  if (partialCohorts.length > 0) {
    recommendations.push(
      `${partialCohorts.length} cohorte${partialCohorts.length > 1 ? 's recientes estan' : ' reciente esta'} aun dentro de la ventana de observacion. Monitorea estos para senales tempranas de cambio de comportamiento.`
    )
  }
  
  // Construir titular
  let headline: string
  let subheadline: string
  
  if (avgRepurchaseRate >= 20) {
    headline = 'Solida Base de Retencion de Clientes'
    subheadline = `${avgRepurchaseRate.toFixed(1)}% de los clientes regresan dentro de ${windowMonths} meses`
  } else if (avgRepurchaseRate >= 10) {
    headline = 'Oportunidad de Crecimiento en Retencion de Clientes'
    subheadline = `La tasa de recompra actual de ${windowMonths} meses del ${avgRepurchaseRate.toFixed(1)}% puede mejorarse`
  } else {
    headline = 'La Retencion Requiere Atencion Inmediata'
    subheadline = `Solo el ${repurchasePercentage.toFixed(1)}% de los clientes ha realizado dos o más compras`
  }
  
  return { headline, subheadline, insights, recommendations }
}

export function BusinessInsights({ analysis }: BusinessInsightsProps) {
  const { headline, subheadline, insights, recommendations } = generateInsights(analysis)
  
  const getInsightStyles = (type: Insight['type']) => {
    switch (type) {
      case 'success':
        return 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400'
      case 'warning':
        return 'border-amber-500/30 bg-amber-500/5 text-amber-400'
      case 'action':
        return 'border-blue-500/30 bg-blue-500/5 text-blue-400'
      default:
        return 'border/50 bg-card text-muted-foreground'
    }
  }
  
  const getIconContainerStyles = (type: Insight['type']) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-500/10 text-emerald-400'
      case 'warning':
        return 'bg-amber-500/10 text-amber-400'
      case 'action':
        return 'bg-blue-500/10 text-blue-400'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }
  
  return (
    <div className="space-y-6">
      {/* Encabezado */}
        <div className="rounded-lg border border-border/50 bg-card p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-accent/10 p-3">
            <Lightbulb className="h-6 w-6 text-accent" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">{headline}</h2>
            <p className="mt-1 text-muted-foreground">{subheadline}</p>
          </div>
        </div>
      </div>
      
      {/* Insights Clave */}
      <div>
        <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Insights Clave
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          {insights.map((insight, index) => (
            <div
              key={index}
              className={`rounded-lg border p-5 ${getInsightStyles(insight.type)}`}
            >
              <div className="flex items-start gap-4">
                <div className={`rounded-lg p-2 ${getIconContainerStyles(insight.type)}`}>
                  {insight.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-semibold text-foreground">{insight.title}</h4>
                    {insight.metric && (
                      <span className="rounded-full bg-background/50 px-2.5 py-0.5 text-sm font-medium">
                        {insight.metric}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {insight.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Recomendaciones Accionables */}
        <div className="rounded-lg border border-border/50 bg-card p-6">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-muted-foreground">
          <Target className="h-4 w-4" />
          Acciones Recomendadas
        </h3>
        <div className="space-y-3">
          {recommendations.map((rec, index) => (
            <div 
              key={index}
              className="flex items-start gap-3 rounded-lg bg-muted/30 p-4"
            >
              <div className="mt-0.5 rounded-full bg-accent/20 p-1">
                <ArrowRight className="h-3 w-3 text-accent" />
              </div>
              <p className="text-sm leading-relaxed text-foreground/90">{rec}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
