'use client'

import { CohortAnalysis } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts'

interface RepurchaseTimingChartProps {
  analysis: CohortAnalysis
}

export function RepurchaseTimingChart({ analysis }: RepurchaseTimingChartProps) {
  const observationWindow = analysis.observationWindow || 6
  
  // Obtener cohortes completamente observados para promedios precisos
  const fullyObserved = analysis.repurchaseAnalysis.filter(c => c.fully_observed)
  
  if (fullyObserved.length === 0) {
    return (
      <Card className="border/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Distribucion del Momento de Recompra</CardTitle>
          <CardDescription>
            No hay cohortes completamente observados disponibles para mostrar el grafico.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex h-[300px] items-center justify-center">
          <p className="text-sm text-muted-foreground">
            Espere a que los cohortes completen su ventana de observacion de {observationWindow} meses.
          </p>
        </CardContent>
      </Card>
    )
  }

  // Calcular tasa promedio de recompra para cada mes
  const monthlyData = Array.from({ length: observationWindow }, (_, i) => ({
    month: `M${i + 1}`,
    label: `Mes ${i + 1}`,
    rate: 0
  }))

  for (const cohort of fullyObserved) {
    cohort.monthly_repurchase.forEach((rate, i) => {
      if (i < observationWindow) {
        monthlyData[i].rate += rate
      }
    })
  }

  for (let i = 0; i < observationWindow; i++) {
    monthlyData[i].rate = Number((monthlyData[i].rate / fullyObserved.length).toFixed(2))
  }

  // Encontrar mes pico
  const peakRate = Math.max(...monthlyData.map(d => d.rate))
  const avgRate = monthlyData.reduce((sum, d) => sum + d.rate, 0) / observationWindow

  // Tooltip personalizado
  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
    if (active && payload && payload.length) {
      const data = monthlyData.find(d => d.month === label)
      const isPeak = payload[0].value === peakRate
      
      return (
        <div className="rounded-lg border border/50 bg-card px-3 py-2 shadow-lg">
          <p className="text-sm font-medium text-foreground">{data?.label}</p>
          <p className={`text-lg font-bold ${isPeak ? 'text-emerald-400' : 'text-foreground'}`}>
            {payload[0].value.toFixed(1)}%
          </p>
          {isPeak && (
            <p className="text-xs text-emerald-400">Mes pico de recompra</p>
          )}
        </div>
      )
    }
    return null
  }

  return (
    <Card className="border/50">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Distribucion del Momento de Recompra</CardTitle>
        <CardDescription>
          Tasa promedio de recompra por mes desde la primera compra en {fullyObserved.length} cohortes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={monthlyData}
              margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="hsl(var(--border))" 
                opacity={0.3}
                vertical={false}
              />
              <XAxis 
                dataKey="month" 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}%`}
                domain={[0, 'auto']}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.2 }} />
              <ReferenceLine 
                y={avgRate} 
                stroke="hsl(var(--muted-foreground))" 
                strokeDasharray="5 5"
                opacity={0.5}
              />
              <Bar 
                dataKey="rate" 
                radius={[4, 4, 0, 0]}
                maxBarSize={60}
              >
                {monthlyData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`}
                    fill={entry.rate === peakRate 
                      ? 'hsl(160 60% 45%)' 
                      : 'hsl(var(--accent))'
                    }
                    opacity={entry.rate === peakRate ? 1 : 0.7}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Insights */}
        <div className="mt-4 flex flex-wrap gap-4 border-t border/30 pt-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-emerald-500" />
            <span className="text-xs text-muted-foreground">
              Pico: M{monthlyData.findIndex(d => d.rate === peakRate) + 1} ({peakRate.toFixed(1)}%)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-px w-4 border-t border-dashed border-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Prom: {avgRate.toFixed(1)}%
            </span>
          </div>
          <div className="ml-auto text-xs text-muted-foreground">
            Recompra total {observationWindow}M: {(monthlyData.reduce((sum, d) => sum + d.rate, 0)).toFixed(1)}% acumulado
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
