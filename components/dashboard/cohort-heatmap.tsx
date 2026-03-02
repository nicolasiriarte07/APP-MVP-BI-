'use client'

import { CohortAnalysis, CohortRepurchaseAnalysis } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, Clock } from 'lucide-react'

interface CohortHeatmapProps {
  analysis: CohortAnalysis
}

function formatCohortLabel(cohort: string): string {
  const [year, month] = cohort.split('-')
  const date = new Date(parseInt(year), parseInt(month) - 1)
  return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short' })
}

function formatRate(rate: number): string {
  return `${rate.toFixed(1)}%`
}

// Obtener color de fondo del heatmap segun valor
function getHeatmapColor(rate: number, isObserved: boolean): string {
  if (!isObserved) return 'bg-muted/30'
  
  // Escala de color de bajo (frio) a alto (calido)
  if (rate >= 12) return 'bg-emerald-500/40'
  if (rate >= 9) return 'bg-emerald-500/30'
  if (rate >= 6) return 'bg-teal-500/25'
  if (rate >= 4) return 'bg-cyan-500/20'
  if (rate >= 2) return 'bg-sky-500/15'
  if (rate > 0) return 'bg-blue-500/10'
  return 'bg-muted/20'
}

// Obtener color de texto para celda del heatmap
function getHeatmapTextColor(rate: number, isObserved: boolean): string {
  if (!isObserved) return 'text-muted-foreground/50'
  if (rate >= 6) return 'text-emerald-400'
  if (rate >= 3) return 'text-teal-400'
  if (rate > 0) return 'text-sky-400'
  return 'text-muted-foreground'
}

// Obtener color de tasa total
function getTotalRateColor(rate: number): string {
  if (rate >= 20) return 'text-emerald-400'
  if (rate >= 15) return 'text-teal-400'
  if (rate >= 10) return 'text-cyan-400'
  return 'text-muted-foreground'
}

function HeatmapCell({ 
  rate, 
  isObserved, 
  isTotal = false 
}: { 
  rate: number
  isObserved: boolean
  isTotal?: boolean 
}) {
  if (!isObserved && !isTotal) {
    return (
      <td className="px-3 py-3 text-center">
        <span className="text-sm text-muted-foreground/40">-</span>
      </td>
    )
  }

  if (isTotal) {
    return (
      <td className="px-3 py-3 text-center">
        <span className={`text-sm font-semibold ${getTotalRateColor(rate)}`}>
          {formatRate(rate)}
        </span>
      </td>
    )
  }

  return (
    <td className={`px-3 py-3 text-center ${getHeatmapColor(rate, isObserved)}`}>
      <span className={`text-sm font-medium ${getHeatmapTextColor(rate, isObserved)}`}>
        {formatRate(rate)}
      </span>
    </td>
  )
}

function CohortRow({ cohort, observationWindow }: { cohort: CohortRepurchaseAnalysis; observationWindow: number }) {
  const isPartial = !cohort.fully_observed
  
  return (
    <tr className={`border-b border/30 transition-colors hover:bg-muted/10 ${isPartial ? 'opacity-60' : ''}`}>
      <td className="sticky left-0 bg-card px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="font-medium">{formatCohortLabel(cohort.cohort)}</span>
          {isPartial ? (
            <Clock className="h-3.5 w-3.5 text-amber-500" />
          ) : (
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          )}
        </div>
      </td>
      <td className="px-3 py-3 text-center">
        <span className="text-sm font-medium">{cohort.cohort_size.toLocaleString()}</span>
      </td>
      <HeatmapCell rate={cohort.total_repurchase_rate} isObserved={true} isTotal={true} />
      {Array.from({ length: observationWindow }, (_, i) => (
        <HeatmapCell 
          key={i}
          rate={cohort.monthly_repurchase[i] || 0} 
          isObserved={cohort.months_observed >= i + 1} 
        />
      ))}
    </tr>
  )
}

export function CohortHeatmap({ analysis }: CohortHeatmapProps) {
  const observationWindow = analysis.observationWindow || 6
  
  // Calcular promedios de columna para cohortes completamente observados
  const fullyObserved = analysis.repurchaseAnalysis.filter(c => c.fully_observed)
  
  const avgTotal = fullyObserved.length > 0
    ? fullyObserved.reduce((sum, c) => sum + c.total_repurchase_rate, 0) / fullyObserved.length
    : 0
    
  const monthlyAvgs = Array.from({ length: observationWindow }, (_, i) => {
    if (fullyObserved.length === 0) return 0
    return fullyObserved.reduce((sum, c) => sum + (c.monthly_repurchase[i] || 0), 0) / fullyObserved.length
  })

  return (
    <Card className="border/50">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Heatmap de Recompra por Cohorte</CardTitle>
        <CardDescription>
          Analisis con ventana de observacion de {observationWindow} meses. Celdas mas oscuras indican mayores tasas de recompra.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border/50 bg-muted/20">
                <th className="sticky left-0 bg-muted/20 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Cohorte
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Tamano
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Total {observationWindow}M
                </th>
                {Array.from({ length: observationWindow }, (_, i) => (
                  <th key={i} className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    M{i + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {analysis.repurchaseAnalysis.map((cohort) => (
                <CohortRow key={cohort.cohort} cohort={cohort} observationWindow={observationWindow} />
              ))}
            </tbody>
            {fullyObserved.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border/50 bg-muted/10">
                  <td className="sticky left-0 bg-muted/10 px-4 py-3">
                    <span className="text-sm font-semibold text-muted-foreground">Promedio</span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className="text-sm text-muted-foreground">-</span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className={`text-sm font-semibold ${getTotalRateColor(avgTotal)}`}>
                      {formatRate(avgTotal)}
                    </span>
                  </td>
                  {monthlyAvgs.map((avg, i) => (
                    <td key={i} className={`px-3 py-3 text-center ${getHeatmapColor(avg, true)}`}>
                      <span className={`text-sm font-medium ${getHeatmapTextColor(avg, true)}`}>
                        {formatRate(avg)}
                      </span>
                    </td>
                  ))}
                </tr>
              </tfoot>
            )}
          </table>
        </div>
        
        {/* Leyenda */}
        <div className="flex flex-wrap items-center gap-4 border-t border/30 px-4 py-3">
          <span className="text-xs font-medium text-muted-foreground">Leyenda:</span>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-xs text-muted-foreground">Completamente observado</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-xs text-muted-foreground">Datos parciales</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="h-3 w-6 rounded bg-blue-500/10" />
              <span className="text-xs text-muted-foreground">Bajo</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-6 rounded bg-teal-500/25" />
              <span className="text-xs text-muted-foreground">Medio</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-6 rounded bg-emerald-500/40" />
              <span className="text-xs text-muted-foreground">Alto</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
