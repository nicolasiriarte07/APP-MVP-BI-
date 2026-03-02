'use client'

import React from "react"
import type { CohortAnalysis } from '@/lib/types'
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Users,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Award,
  BarChart3,
  PiggyBank,
  Megaphone
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ExecutiveInsightsProps {
  analysis: CohortAnalysis
}

interface StrategicInsight {
  category: 'velocity' | 'cohort-value' | 'spending-behavior' | 'investment'
  priority: 'critical' | 'high' | 'medium'
  headline: string
  finding: string
  implication: string
  recommendation: string
  metric: string
  trend: 'positive' | 'negative' | 'neutral'
}

function generateExecutiveInsights(analysis: CohortAnalysis): {
  summary: {
    headline: string
    context: string
    bottomLine: string
  }
  insights: StrategicInsight[]
  investmentGuidance: {
    acquisition: string
    retention: string
    reactivation: string
  }
} {
  const { revenueMetrics, orderMetrics, recencyMetrics, repurchaseAnalysis } = analysis
  const cohortMetrics = revenueMetrics.cohortMetrics
  
  // Calcular velocidad de revenue
  const ltv1mToLtv6mRatio = revenueMetrics.avgLtv6m > 0 
    ? (revenueMetrics.avgLtv1m / revenueMetrics.avgLtv6m) * 100 
    : 0
  const ltv6mToLtv12mGrowth = revenueMetrics.avgLtv6m > 0
    ? ((revenueMetrics.avgLtv12m - revenueMetrics.avgLtv6m) / revenueMetrics.avgLtv6m) * 100
    : 0
  
  // Encontrar cohortes de alto y bajo valor
  const sortedByLtv = [...cohortMetrics].sort((a, b) => b.ltv6m - a.ltv6m)
  const topCohorts = sortedByLtv.slice(0, 3)
  const bottomCohorts = sortedByLtv.slice(-3).reverse()
  
  const avgLtv6m = cohortMetrics.length > 0
    ? cohortMetrics.reduce((sum, c) => sum + c.ltv6m, 0) / cohortMetrics.length
    : 0
  
  const ltvVariance = topCohorts[0] && bottomCohorts[0]
    ? ((topCohorts[0].ltv6m - bottomCohorts[0].ltv6m) / avgLtv6m) * 100
    : 0
  
  // Analizar evolucion de gasto
  const aovProgression = orderMetrics.aov2 > 0 && orderMetrics.aov1 > 0
    ? ((orderMetrics.aov2 - orderMetrics.aov1) / orderMetrics.aov1) * 100
    : 0
  const aov3vs1 = orderMetrics.aov3 > 0 && orderMetrics.aov1 > 0
    ? ((orderMetrics.aov3 - orderMetrics.aov1) / orderMetrics.aov1) * 100
    : 0
  
  // Calcular valor incremental de recompras
  const repurchaseContribution = revenueMetrics.repurchasePercent
  const avgOrdersPerRepurchaser = orderMetrics.customers2 > 0
    ? (orderMetrics.customers3 + orderMetrics.customers4 * 2 + orderMetrics.customers2) / orderMetrics.customers2
    : 0
  
  // Tiempo promedio para generar valor
  const daysToSecondPurchase = recencyMetrics.avgDays1to2 || 0
  const revenueVelocity = daysToSecondPurchase > 0 && revenueMetrics.avgLtv3m > 0
    ? revenueMetrics.avgLtv3m / 90 // Revenue por dia en primeros 3 meses
    : 0
  
  const insights: StrategicInsight[] = []
  
  // INSIGHT 1: Velocidad de generacion de revenue
  const velocityInsight: StrategicInsight = {
    category: 'velocity',
    priority: ltv1mToLtv6mRatio > 70 ? 'high' : 'medium',
    headline: ltv1mToLtv6mRatio > 60 
      ? 'Los clientes generan valor rapidamente'
      : 'El valor del cliente se construye gradualmente',
    finding: `El ${ltv1mToLtv6mRatio.toFixed(0)}% del LTV de 6 meses se captura en el primer mes. ${
      daysToSecondPurchase > 0 
        ? `El tiempo promedio hasta la segunda compra es de ${daysToSecondPurchase} dias.`
        : ''
    }`,
    implication: ltv1mToLtv6mRatio > 60
      ? 'El ciclo de recuperacion de CAC es corto, permitiendo reinversion agresiva en adquisicion.'
      : 'Se requiere paciencia financiera; el valor real del cliente emerge con el tiempo.',
    recommendation: ltv1mToLtv6mRatio > 60
      ? 'Maximiza inversion en adquisicion durante periodos de alta conversion. El payback rapido reduce riesgo.'
      : 'Estructura financiamiento considerando ciclos de 90+ dias. Prioriza retencion sobre volumen de adquisicion.',
    metric: `${ltv1mToLtv6mRatio.toFixed(0)}% en M1`,
    trend: ltv1mToLtv6mRatio > 50 ? 'positive' : 'neutral'
  }
  insights.push(velocityInsight)
  
  // INSIGHT 2: Cohortes de alto valor
  if (topCohorts[0]) {
    const bestCohortName = formatCohortName(topCohorts[0].cohort)
    const worstCohortName = bottomCohorts[0] ? formatCohortName(bottomCohorts[0].cohort) : ''
    
    insights.push({
      category: 'cohort-value',
      priority: ltvVariance > 30 ? 'critical' : 'high',
      headline: ltvVariance > 30 
        ? 'Alta variabilidad entre cohortes'
        : 'Cohortes relativamente homogeneos',
      finding: `El cohorte de ${bestCohortName} genera $${topCohorts[0].ltv6m.toFixed(0)} de LTV 6M, ${
        bottomCohorts[0] 
          ? `${((topCohorts[0].ltv6m / bottomCohorts[0].ltv6m - 1) * 100).toFixed(0)}% mas que ${worstCohortName}.`
          : '.'
      }`,
      implication: ltvVariance > 30
        ? 'Existen factores estacionales o de canal que impactan significativamente la calidad del cliente.'
        : 'La calidad del cliente es predecible independientemente del momento de adquisicion.',
      recommendation: ltvVariance > 30
        ? `Analiza que diferencia a los clientes de ${bestCohortName}: canal de origen, promociones activas, o mix de productos. Replica esas condiciones.`
        : 'Enfoca optimizacion en eficiencia de adquisicion y experiencia post-compra uniforme.',
      metric: `$${topCohorts[0].ltv6m.toFixed(0)} top`,
      trend: ltvVariance > 30 ? 'neutral' : 'positive'
    })
  }
  
  // INSIGHT 3: Evolucion del gasto
  insights.push({
    category: 'spending-behavior',
    priority: Math.abs(aovProgression) > 15 ? 'high' : 'medium',
    headline: aovProgression > 5 
      ? 'Los clientes incrementan su gasto'
      : aovProgression < -5
        ? 'El gasto disminuye en compras posteriores'
        : 'Gasto consistente entre compras',
    finding: `El ticket promedio ${
      aovProgression > 0 ? 'aumenta' : aovProgression < 0 ? 'disminuye' : 'se mantiene'
    } un ${Math.abs(aovProgression).toFixed(0)}% de la 1ra a la 2da compra ($${orderMetrics.aov1.toFixed(0)} a $${orderMetrics.aov2.toFixed(0)}).${
      orderMetrics.aov3 > 0 ? ` Para la 3ra compra: $${orderMetrics.aov3.toFixed(0)}.` : ''
    }`,
    implication: aovProgression > 5
      ? 'Los clientes desarrollan confianza y expanden su relacion con la marca. Excelente senal de product-market fit.'
      : aovProgression < -5
        ? 'Posible patron de "cherry-picking": clientes buscan ofertas especificas sin compromiso con la marca.'
        : 'Comportamiento de compra estable sugiere necesidades definidas y predecibles.',
    recommendation: aovProgression > 5
      ? 'Introduce upsells y cross-sells despues de la primera compra. Los clientes estan receptivos a expandir.'
      : aovProgression < -5
        ? 'Revisa si promociones de primera compra crean expectativas de descuento. Considera bundles de valor en lugar de descuentos.'
        : 'Implementa programas de suscripcion o compra recurrente para capturar la demanda predecible.',
    metric: `${aovProgression > 0 ? '+' : ''}${aovProgression.toFixed(0)}% AOV`,
    trend: aovProgression > 0 ? 'positive' : aovProgression < -5 ? 'negative' : 'neutral'
  })
  
  // INSIGHT 4: Valor de las recompras
  insights.push({
    category: 'investment',
    priority: repurchaseContribution > 30 ? 'critical' : 'high',
    headline: repurchaseContribution > 40
      ? 'Las recompras son el motor del negocio'
      : repurchaseContribution > 20
        ? 'Oportunidad significativa en recompras'
        : 'Negocio dependiente de nuevos clientes',
    finding: `El ${repurchaseContribution.toFixed(0)}% del revenue proviene de recompras. Cada cliente que recompra genera en promedio ${
      orderMetrics.aov2 > 0 ? `$${(orderMetrics.aov2 + (orderMetrics.aov3 || 0) + (orderMetrics.aov4 || 0)).toFixed(0)}` : 'N/A'
    } adicionales.`,
    implication: repurchaseContribution > 40
      ? 'La retencion es mas valiosa que la adquisicion. Cada punto de mejora en retencion tiene alto apalancamiento.'
      : repurchaseContribution > 20
        ? 'Balance entre adquisicion y retencion. Ambos canales merecen inversion proporcional.'
        : 'El modelo actual depende de flujo constante de nuevos clientes. Esto es costoso y fragil.',
    recommendation: repurchaseContribution > 40
      ? 'Destina al menos 30% del presupuesto de marketing a retencion. El ROI sera superior a adquisicion.'
      : repurchaseContribution > 20
        ? 'Implementa automatizaciones de ciclo de vida: bienvenida, reactivacion, y cross-sell basado en comportamiento.'
        : 'Urgente: desarrolla estrategia de retencion. Considera si el producto permite compra repetida o necesita expansion de catalogo.',
    metric: `${repurchaseContribution.toFixed(0)}% del revenue`,
    trend: repurchaseContribution > 30 ? 'positive' : 'negative'
  })
  
  // INSIGHT 5: Crecimiento de LTV a largo plazo
  if (revenueMetrics.avgLtv12m > revenueMetrics.avgLtv6m) {
    insights.push({
      category: 'velocity',
      priority: ltv6mToLtv12mGrowth > 20 ? 'high' : 'medium',
      headline: ltv6mToLtv12mGrowth > 30
        ? 'El valor continua creciendo significativamente'
        : 'Crecimiento moderado post 6 meses',
      finding: `El LTV crece ${ltv6mToLtv12mGrowth.toFixed(0)}% entre el mes 6 y 12 ($${revenueMetrics.avgLtv6m.toFixed(0)} a $${revenueMetrics.avgLtv12m.toFixed(0)}).`,
      implication: ltv6mToLtv12mGrowth > 30
        ? 'Los clientes leales tienen ciclos de vida largos. Vale la pena invertir en relaciones a largo plazo.'
        : 'La mayor parte del valor se captura en los primeros 6 meses. Enfoca recursos en ese periodo.',
      recommendation: ltv6mToLtv12mGrowth > 30
        ? 'Desarrolla programas de lealtad con beneficios que escalen con el tiempo. Los clientes de largo plazo son tu activo mas valioso.'
        : 'Concentra esfuerzos de retencion en los primeros 6 meses. Despues, enfoca en reactivacion selectiva de alto valor.',
      metric: `+${ltv6mToLtv12mGrowth.toFixed(0)}% 6-12M`,
      trend: ltv6mToLtv12mGrowth > 20 ? 'positive' : 'neutral'
    })
  }
  
  // Generar summary ejecutivo
  const summary = {
    headline: repurchaseContribution > 35 && avgLtv6m > 100
      ? 'Base de clientes saludable con alto potencial de crecimiento'
      : repurchaseContribution > 20
        ? 'Fundamentos solidos con oportunidades de optimizacion'
        : 'Modelo de negocio requiere fortalecimiento en retencion',
    context: `LTV promedio de 6 meses: $${revenueMetrics.avgLtv6m.toFixed(0)}. ${repurchaseContribution.toFixed(0)}% del revenue de recompras. Retencion 1ra-2da compra: ${orderMetrics.retention1to2.toFixed(0)}%.`,
    bottomLine: repurchaseContribution > 35
      ? 'Prioridad: escalar adquisicion manteniendo calidad. La maquina de retencion esta funcionando.'
      : repurchaseContribution > 20
        ? 'Prioridad: mejorar conversion a segunda compra. Cada punto porcentual tiene alto impacto en rentabilidad.'
        : 'Prioridad: investigar por que los clientes no regresan. Sin retencion, el crecimiento no es sostenible.'
  }
  
  // Guia de inversion
  const investmentGuidance = {
    acquisition: repurchaseContribution > 35
      ? `CAC objetivo: hasta $${(revenueMetrics.avgLtv6m * 0.3).toFixed(0)} por cliente (30% del LTV 6M). Con tu retencion actual, puedes ser agresivo en adquisicion.`
      : `CAC objetivo: maximo $${(revenueMetrics.avgLtv6m * 0.2).toFixed(0)} por cliente (20% del LTV 6M). Hasta mejorar retencion, se conservador en adquisicion.`,
    retention: repurchaseContribution > 35
      ? 'Mantener inversion actual. Enfocate en incrementar frecuencia y ticket de clientes existentes a traves de cross-sell.'
      : `Incrementar presupuesto de retencion. Meta: mejorar conversion a 2da compra del ${orderMetrics.retention1to2.toFixed(0)}% al ${Math.min(orderMetrics.retention1to2 + 10, 50).toFixed(0)}%. Esto agregaria ~$${((revenueMetrics.totalRevenue * 0.1) / 1000).toFixed(0)}K en revenue.`,
    reactivation: daysToSecondPurchase > 60
      ? `Campana de reactivacion a los ${Math.floor(daysToSecondPurchase * 0.8)} dias post-compra. Los clientes que no actuan para el dia ${daysToSecondPurchase * 1.5} probablemente estan perdidos.`
      : 'Ventana de recompra corta. Enfoca en upsell inmediato post-compra en lugar de reactivacion tardia.'
  }
  
  return { summary, insights, investmentGuidance }
}

function formatCohortName(cohort: string): string {
  const [year, month] = cohort.split('-')
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
  return `${monthNames[parseInt(month) - 1]} ${year}`
}

export function ExecutiveInsights({ analysis }: ExecutiveInsightsProps) {
  const { summary, insights, investmentGuidance } = generateExecutiveInsights(analysis)
  
  const getCategoryIcon = (category: StrategicInsight['category']) => {
    switch (category) {
      case 'velocity': return <Zap className="h-5 w-5" />
      case 'cohort-value': return <Award className="h-5 w-5" />
      case 'spending-behavior': return <BarChart3 className="h-5 w-5" />
      case 'investment': return <PiggyBank className="h-5 w-5" />
    }
  }
  
  const getCategoryLabel = (category: StrategicInsight['category']) => {
    switch (category) {
      case 'velocity': return 'Velocidad de Valor'
      case 'cohort-value': return 'Valor por Cohorte'
      case 'spending-behavior': return 'Comportamiento de Gasto'
      case 'investment': return 'Retorno de Inversion'
    }
  }
  
  const getPriorityStyles = (priority: StrategicInsight['priority']) => {
    switch (priority) {
      case 'critical': return 'border-l-4 border-l-rose-500'
      case 'high': return 'border-l-4 border-l-amber-500'
      case 'medium': return 'border-l-4 border-l-blue-500'
    }
  }
  
  const getTrendIcon = (trend: StrategicInsight['trend']) => {
    switch (trend) {
      case 'positive': return <ArrowUpRight className="h-4 w-4 text-emerald-500" />
      case 'negative': return <ArrowDownRight className="h-4 w-4 text-rose-500" />
      case 'neutral': return <TrendingUp className="h-4 w-4 text-muted-foreground" />
    }
  }
  
  return (
    <div className="space-y-8">
      {/* Header Ejecutivo */}
      <div className="rounded-xl border border bg-gradient-to-br from-card via-card to-muted/20 p-8">
        <div className="flex items-start gap-6">
          <div className="rounded-xl bg-gradient-to-br from-accent to-accent/50 p-4">
            <DollarSign className="h-8 w-8 text-accent-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Resumen Ejecutivo
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
              {summary.headline}
            </h2>
            <p className="mt-3 text-base text-muted-foreground">
              {summary.context}
            </p>
            <div className="mt-4 rounded-lg bg-muted/50 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Target className="h-4 w-4 text-accent" />
                Linea de Fondo
              </p>
              <p className="mt-1 text-sm text-foreground/90">
                {summary.bottomLine}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Insights Estrategicos */}
      <div>
        <h3 className="mb-6 text-lg font-semibold tracking-tight">
          Insights Estrategicos
        </h3>
        <div className="grid gap-6 lg:grid-cols-2">
          {insights.map((insight, index) => (
            <Card key={index} className={`bg-card ${getPriorityStyles(insight.priority)}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-muted p-2">
                      {getCategoryIcon(insight.category)}
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {getCategoryLabel(insight.category)}
                      </p>
                      <CardTitle className="mt-1 text-base">
                        {insight.headline}
                      </CardTitle>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-muted px-3 py-1">
                    {getTrendIcon(insight.trend)}
                    <span className="text-sm font-semibold">{insight.metric}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Hallazgo
                  </p>
                  <p className="mt-1 text-sm text-foreground/90">
                    {insight.finding}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Implicacion
                  </p>
                  <p className="mt-1 text-sm text-foreground/90">
                    {insight.implication}
                  </p>
                </div>
                <div className="rounded-lg bg-accent/10 p-3">
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent">
                    <Target className="h-3 w-3" />
                    Recomendacion
                  </p>
                  <p className="mt-1 text-sm font-medium text-foreground">
                    {insight.recommendation}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Guia de Inversion */}
      <Card className="bg-gradient-to-br from-card to-muted/30">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-accent/20 p-2">
              <Megaphone className="h-5 w-5 text-accent" />
            </div>
            <CardTitle>Guia de Inversion en Marketing</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-lg bg-blue-500/10 p-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-400" />
                <p className="text-sm font-semibold text-blue-400">Adquisicion</p>
              </div>
              <p className="mt-2 text-sm text-foreground/90">
                {investmentGuidance.acquisition}
              </p>
            </div>
            <div className="rounded-lg bg-emerald-500/10 p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                <p className="text-sm font-semibold text-emerald-400">Retencion</p>
              </div>
              <p className="mt-2 text-sm text-foreground/90">
                {investmentGuidance.retention}
              </p>
            </div>
            <div className="rounded-lg bg-amber-500/10 p-4">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-400" />
                <p className="text-sm font-semibold text-amber-400">Reactivacion</p>
              </div>
              <p className="mt-2 text-sm text-foreground/90">
                {investmentGuidance.reactivation}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
