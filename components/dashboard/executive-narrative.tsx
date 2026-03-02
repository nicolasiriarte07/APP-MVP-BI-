'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ExecutiveNarrative } from '@/lib/narrative-utils'
import { AlertTriangle, TrendingUp, Zap, DollarSign, Target } from 'lucide-react'

interface ExecutiveNarrativeProps {
  narrative: ExecutiveNarrative
}

export function ExecutiveNarrativeComponent({ narrative }: ExecutiveNarrativeProps) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)

  return (
    <div className="space-y-6">
      {/* Narrativa de 30 Días */}
      <Card className="border/50 bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-5 w-5 text-chart-1" />
            Narrativa de 30 Días
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="font-semibold text-lg">
              {narrative.thirtyDay.revenueChangePercent >= 0 ? 'Ingresos' : 'Ingresos'}
              {' '}
              <span
                className={narrative.thirtyDay.revenueChangePercent >= 0 ? 'text-emerald-600' : 'text-red-600'}
              >
                {narrative.thirtyDay.revenueChangePercent >= 0 ? 'subieron' : 'bajaron'} {Math.abs(narrative.thirtyDay.revenueChangePercent).toFixed(1)}%
              </span>
              {' '}
              vs. 30 días anteriores ({formatCurrency(narrative.thirtyDay.previous30DaysRevenue)} → {formatCurrency(narrative.thirtyDay.current30DaysRevenue)})
            </p>
          </div>

          <div className="rounded-lg bg-background p-3 text-sm space-y-2">
            <p className="font-semibold text-foreground">Por qué:</p>
            <ul className="space-y-1 text-muted-foreground text-sm">
              <li>• {narrative.thirtyDay.primaryCause}</li>
              {narrative.thirtyDay.secondaryCauses.map((cause, i) => (
                <li key={i}>
                  • {cause.cause}: {formatCurrency(cause.impact)}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg bg-background p-3 text-sm border border/30">
            <p className="text-muted-foreground">
              <span className="font-semibold">Implicación:</span> Si este patrón continúa, proyectamos{' '}
              <span className="font-semibold">{formatCurrency(narrative.thirtyDay.projection90Days)}</span> en los próximos 90 días
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Alerta Crítica */}
      {narrative.criticalAlert.atRiskPercentage > 5 && (
        <Card className="border-red-500/30 bg-red-500/5 ring-1 ring-red-500/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Alerta Crítica
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>
              <span className="font-semibold">{formatCurrency(narrative.criticalAlert.totalAtRiskRevenue)}</span> en ingresos futuros en riesgo inmediato.
            </p>
            <p>
              <span className="font-semibold">{narrative.criticalAlert.atRiskPercentage.toFixed(1)}%</span> de tu base está a punto de abandonar.
            </p>
            <div className="rounded-lg bg-background p-3 text-xs space-y-1">
              <p className="font-semibold text-foreground">Desglose:</p>
              <p>
                • <span className="font-semibold">{narrative.criticalAlert.customerAtRisk.count}</span> clientes en riesgo de churn = {formatCurrency(narrative.criticalAlert.customerAtRisk.revenue)} en LTV
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Prioridad #1 Esta Semana */}
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-amber-700">
            <Zap className="h-5 w-5" />
            Prioridad #1 Esta Semana
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="font-semibold text-base">{narrative.topPriority.actionName}</p>
          <div className="space-y-2 text-muted-foreground">
            <p>
              • <span className="font-semibold">{narrative.topPriority.customerCount}</span> clientes en este grupo
            </p>
            <p>
              • Valor en riesgo: <span className="font-semibold">{formatCurrency(narrative.topPriority.valueAtStake)}</span>
            </p>
            <p>
              • Acción: {narrative.topPriority.description}
            </p>
            <p>
              • Timing: {narrative.topPriority.timing}
            </p>
            <p>
              • ROI esperado: <span className="font-semibold">{formatCurrency(narrative.topPriority.expectedRoi)}</span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Resumen Ejecutivo */}
      <Card className="border/50 bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <DollarSign className="h-5 w-5 text-chart-3" />
            Resumen Ejecutivo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            Tu LTV promedio es <span className="font-semibold">{formatCurrency(narrative.executiveSummary.avgLTV)}</span> (6 meses). {narrative.executiveSummary.repeatRevenuePercent.toFixed(1)}% del revenue viene de recompras.
          </p>
          <p>
            La retención 1ra→2da compra es <span className="font-semibold">{narrative.executiveSummary.retention1to2.toFixed(1)}%</span>.
          </p>
          <div className="rounded-lg bg-background p-3 mt-3">
            <p className="font-semibold text-foreground">Línea de fondo:</p>
            <p className="text-muted-foreground mt-1">{narrative.executiveSummary.bottleneckImplication}</p>
          </div>
        </CardContent>
      </Card>

      {/* Métricas Clave */}
      <div className="grid gap-4 sm:grid-cols-3">
        {narrative.keyMetrics.map((metric, i) => (
          <Card key={i} className="border/50 bg-card">
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-muted-foreground mb-2">{metric.title}</p>
              <p className="text-2xl font-bold">
                {metric.metric.toFixed(metric.metricLabel === '%' ? 1 : 0)}
                <span className="text-lg font-semibold ml-1">{metric.metricLabel}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-2">{metric.meaning}</p>
              <div className="mt-2 pt-2 border-t border/30">
                <p className="text-xs text-muted-foreground italic">{metric.implication}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
