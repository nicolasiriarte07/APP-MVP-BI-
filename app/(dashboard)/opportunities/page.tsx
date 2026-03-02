'use client'

import { useData } from '@/components/layout/data-provider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, AlertCircle, Target, Zap, Package, Lightbulb } from 'lucide-react'
import { generateExecutiveNarrative } from '@/lib/narrative-utils'

export default function OpportunitiesPage() {
  const { analysis } = useData()

  if (!analysis) {
    return null
  }

  const globalRepurchaseRate = analysis.globalRepurchaseRate
  const avgLtv12m = analysis.revenueMetrics.avgLtv12m
  const highestLtvCohort = analysis.revenueMetrics.cohortMetrics.sort(
    (a, b) => b.ltv6m - a.ltv6m
  )[0]

  const opportunities = [
    {
      title: 'Mejorar Tasa de Segunda Compra',
      description: `Solo el ${analysis.orderMetrics.retention1to2.toFixed(1)}% de clientes hacen una segunda compra. Implementa un programa de incentivos post-compra en los primeros 30 días.`,
      impact: 'Alto',
      icon: TrendingUp,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
    },
    {
      title: 'Maximizar AOV en Primeras Compras',
      description: `El ticket promedio de primera compra es ${(analysis.orderMetrics.aov1).toFixed(2)}. Prueba bundle de productos o upsells automáticos en checkout.`,
      impact: 'Alto',
      icon: Zap,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
    {
      title: 'Retención a Largo Plazo',
      description: `Con una tasa global de recompra del ${globalRepurchaseRate.toFixed(1)}%, existe espacio para crecer. Enfócate en retener clientes después de M3.`,
      impact: 'Crítico',
      icon: AlertCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
    },
    {
      title: 'Replicar Cohort de Alto Valor',
      description: `El cohorte ${highestLtvCohort.cohort} genera un LTV 6M de ${highestLtvCohort.ltv6m.toFixed(2)}. Investiga y replica los canales/campañas de ese período.`,
      impact: 'Alto',
      icon: Target,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
  ]

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  // Get narrative opportunities
  const narrative = generateExecutiveNarrative(analysis)
  const narrativeActions = narrative.otherActions

  return (
    <div className="space-y-6 w-full px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Oportunidades</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Centro de comando de crecimiento. Insights orientados a acciones y recomendaciones estratégicas
        </p>
      </div>

      {/* Opportunities Grid - First */}
      <div className="grid gap-6 md:grid-cols-2">
        {opportunities.map((opp, idx) => {
          const Icon = opp.icon
          return (
            <Card key={idx} className="border/50 bg-card">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{opp.title}</CardTitle>
                    <CardDescription className="mt-1">{opp.description}</CardDescription>
                  </div>
                  <div className={`${opp.bgColor} rounded-lg p-2 ml-2`}>
                    <Icon className={`h-5 w-5 ${opp.color}`} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between pt-2 border-t border/30">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">Impacto</span>
                  <span className={`text-xs font-bold ${
                    opp.impact === 'Crítico' ? 'text-red-500' : 
                    opp.impact === 'Alto' ? 'text-amber-500' : 
                    'text-emerald-500'
                  }`}>
                    {opp.impact}
                  </span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Hidden Bundle Revenue Opportunities - Second */}
      {analysis.productIntelligence.missing_bundle_opportunities.length > 0 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Package className="h-5 w-5 text-accent" />
              Oportunidades de Bundle Oculto
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Combinaciones de productos que los clientes compran juntas frecuentemente pero no están siendo promovidas
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {analysis.productIntelligence.missing_bundle_opportunities.map((bundle, idx) => (
              <Card key={idx} className="border-accent/30 bg-background">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground mb-2">Productos</p>
                      <div className="flex flex-wrap gap-2">
                        {bundle.products.map((product, pIdx) => (
                          <span key={pIdx} className="px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium">
                            {product}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-muted-foreground mb-1">Por qué está pasando</p>
                      <p className="text-sm text-foreground">{bundle.why_its_happening}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-3 pt-2 border-t border/30">
                      <div>
                        <p className="text-xs text-muted-foreground">Compras Juntas</p>
                        <p className="text-lg font-bold text-accent">{bundle.co_purchase_frequency}x</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">AOV Actual</p>
                        <p className="text-lg font-bold text-foreground">{formatCurrency(bundle.avg_order_value)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Potencial Upside</p>
                        <p className="text-lg font-bold text-chart-3">{formatCurrency(bundle.estimated_revenue_upside)}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-muted-foreground mb-2">Acciones Recomendadas</p>
                      <ul className="space-y-1">
                        {bundle.recommended_actions.map((action, aIdx) => (
                          <li key={aIdx} className="text-sm text-foreground flex items-start gap-2">
                            <span className="text-accent mt-0.5">•</span>
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Implementation Timeline */}
      <Card className="border/50 bg-card">
        <CardHeader>
          <CardTitle>Roadmap de Implementación</CardTitle>
          <CardDescription>Orden recomendado por impacto potencial</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 font-semibold text-sm">1</div>
              <div className="flex-1 pt-1">
                <p className="font-medium text-foreground">Mejorar Segunda Compra (0-30 días)</p>
                <p className="text-sm text-muted-foreground">Campaña post-compra y programa de lealtad temprana</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500 font-semibold text-sm">2</div>
              <div className="flex-1 pt-1">
                <p className="font-medium text-foreground">Optimizar Ticket Primera Compra</p>
                <p className="text-sm text-muted-foreground">A/B testing en bundles y upsells de checkout</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 font-semibold text-sm">3</div>
              <div className="flex-1 pt-1">
                <p className="font-medium text-foreground">Análisis de Canales Top</p>
                <p className="text-sm text-muted-foreground">Replicar tácticas de cohortes de alto LTV</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10 text-red-500 font-semibold text-sm">4</div>
              <div className="flex-1 pt-1">
                <p className="font-medium text-foreground">Estrategia de Retención M3+</p>
                <p className="text-sm text-muted-foreground">Campaigns dirigidas para mantener engagement más allá de 3 meses</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Oportunidades desde Narrativa Ejecutiva */}
      {narrativeActions && narrativeActions.length > 0 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-chart-1" />
              Acciones Prioritarias (Próximos 7-14 días)
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Oportunidades inmediatas basadas en el análisis narrativo de los últimos 30 días
            </p>
          </div>

          <div className="space-y-3">
            {narrativeActions.map((action, i) => (
              <Card key={i} className="border/50 bg-card">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div>
                      <p className="font-semibold text-base text-foreground">{i + 1}. {action.action}</p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="rounded-lg bg-background p-3 border border/30">
                        <p className="text-xs text-muted-foreground font-semibold mb-1">CLIENTES OBJETIVO</p>
                        <p className="text-xl font-bold text-foreground">{action.customerCount.toLocaleString()}</p>
                      </div>

                      <div className="rounded-lg bg-background p-3 border border/30">
                        <p className="text-xs text-muted-foreground font-semibold mb-1">IMPACTO ESTIMADO</p>
                        <p className="text-xl font-bold text-chart-1">{formatCurrency(action.estimatedImpact)}</p>
                      </div>

                      <div className="rounded-lg bg-background p-3 border border/30">
                        <p className="text-xs text-muted-foreground font-semibold mb-1">TIMING</p>
                        <p className="text-sm font-bold text-foreground">{action.timing}</p>
                      </div>

                      <div className="rounded-lg bg-background p-3 border border/30">
                        <p className="text-xs text-muted-foreground font-semibold mb-1">ESFUERZO</p>
                        <p className={`text-sm font-bold ${
                          action.effort === 'bajo' ? 'text-emerald-600' :
                          action.effort === 'medio' ? 'text-amber-600' :
                          'text-red-600'
                        }`}>
                          {action.effort.charAt(0).toUpperCase() + action.effort.slice(1)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
