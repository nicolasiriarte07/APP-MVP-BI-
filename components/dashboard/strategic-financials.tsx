'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { CohortAnalysis } from '@/lib/types'
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  Bar,
  BarChart,
} from 'recharts'
import { TrendingUp, Layers, Target, ArrowUpRight } from 'lucide-react'

interface StrategicFinancialsProps {
  analysis: CohortAnalysis
}

const COHORT_COLORS = [
  '#3b82f6', // blue
  '#06b6d4', // cyan
  '#10b981', // emerald
  '#8b5cf6', // violet
  '#f59e0b', // amber
  '#ef4444', // red
  '#ec4899', // pink
  '#14b8a6', // teal
]

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

const formatCurrencyShort = (value: number) => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`
  }
  return `$${value.toFixed(0)}`
}

export function StrategicFinancials({ analysis }: StrategicFinancialsProps) {
  const { revenueMetrics, orderMetrics } = analysis
  
  // Seleccionar los ultimos 6 cohortes para las curvas
  const selectedCohorts = revenueMetrics.cohortMetrics.slice(-6)
  
  // Datos para curvas de crecimiento LTV por cohorte
  const ltvGrowthData = Array.from({ length: 5 }, (_, monthIndex) => {
    const point: Record<string, number | string> = {
      month: monthIndex === 0 ? 'M0' : `M${monthIndex * 3}`,
      label: monthIndex === 0 ? 'Inicial' : `${monthIndex * 3}M`,
    }
    
    selectedCohorts.forEach((cohort, idx) => {
      if (monthIndex === 0) {
        point[cohort.cohort] = cohort.ltv1m
      } else if (monthIndex === 1) {
        point[cohort.cohort] = cohort.ltv3m
      } else if (monthIndex === 2) {
        point[cohort.cohort] = cohort.ltv6m
      } else if (monthIndex === 3) {
        point[cohort.cohort] = cohort.ltv12m
      } else {
        // Proyeccion estimada para visualizacion
        point[cohort.cohort] = cohort.ltv12m * 1.1
      }
    })
    
    return point
  })
  
  // Datos de acumulacion de revenue por mes (area chart comparativo)
  const revenueAccumulationByMonth = Array.from({ length: 12 }, (_, monthIndex) => {
    const point: Record<string, number | string> = {
      month: `M${monthIndex}`,
      label: monthIndex === 0 ? 'Mes 0' : `Mes ${monthIndex}`,
    }
    
    // Calcular revenue acumulado hasta este mes para cada cohorte
    selectedCohorts.forEach((cohort) => {
      let accumulated = 0
      for (let i = 0; i <= monthIndex; i++) {
        accumulated += cohort.revenueByMonth[i] || 0
      }
      point[cohort.cohort] = accumulated
    })
    
    return point
  })
  
  // Datos de contribucion de recompras al revenue total por cohorte
  const repurchaseContribution = selectedCohorts.map((cohort) => ({
    cohort: cohort.cohort,
    firstPurchase: cohort.firstPurchaseRevenue,
    repurchase: cohort.repurchaseRevenue,
    total: cohort.firstPurchaseRevenue + cohort.repurchaseRevenue,
    repurchasePercent: cohort.repurchasePercent,
  }))
  
  // Datos de AOV por numero de compra (para visualizacion estrategica)
  const aovProgression = [
    { 
      purchase: '1ra', 
      aov: orderMetrics.aov1, 
      customers: orderMetrics.customers1,
      revenue: orderMetrics.aov1 * orderMetrics.customers1,
      fill: '#3b82f6'
    },
    { 
      purchase: '2da', 
      aov: orderMetrics.aov2, 
      customers: orderMetrics.customers2,
      revenue: orderMetrics.aov2 * orderMetrics.customers2,
      fill: '#06b6d4'
    },
    { 
      purchase: '3ra', 
      aov: orderMetrics.aov3, 
      customers: orderMetrics.customers3,
      revenue: orderMetrics.aov3 * orderMetrics.customers3,
      fill: '#10b981'
    },
    { 
      purchase: '4ta', 
      aov: orderMetrics.aov4, 
      customers: orderMetrics.customers4,
      revenue: orderMetrics.aov4 * orderMetrics.customers4,
      fill: '#8b5cf6'
    },
  ]
  
  // Calcular revenue total por numero de compra
  const totalRevenueByPurchase = aovProgression.reduce((sum, p) => sum + p.revenue, 0)
  
  // Datos para el grafico de composicion de revenue
  const revenueComposition = aovProgression.map(p => ({
    ...p,
    percent: totalRevenueByPurchase > 0 ? (p.revenue / totalRevenueByPurchase) * 100 : 0,
  }))
  
  // Metricas clave calculadas
  const avgLtvGrowth = revenueMetrics.avgLtv6m > 0 
    ? ((revenueMetrics.avgLtv12m - revenueMetrics.avgLtv6m) / revenueMetrics.avgLtv6m) * 100 
    : 0
  
  const bestCohort = revenueMetrics.cohortMetrics.reduce((best, current) => 
    current.ltv6m > best.ltv6m ? current : best
  , revenueMetrics.cohortMetrics[0])
  
  const repurchaseRevenueShare = revenueMetrics.repurchasePercent

  return (
    <div className="space-y-6">
      {/* Titulo de seccion */}
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-emerald-500/10 p-2">
          <TrendingUp className="h-5 w-5 text-emerald-500" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">Vision Financiera Estrategica</h2>
          <p className="text-sm text-muted-foreground">
            Analisis de LTV, revenue y valor de cliente para decisiones de inversion
          </p>
        </div>
      </div>
      
      {/* KPIs Estrategicos */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-300/80">LTV 12M Promedio</p>
                <p className="text-2xl font-bold text-blue-400">{formatCurrency(revenueMetrics.avgLtv12m)}</p>
              </div>
              <div className="rounded-full bg-blue-500/20 p-3">
                <Target className="h-5 w-5 text-blue-400" />
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Crecimiento 6M a 12M: <span className="text-emerald-400">+{avgLtvGrowth.toFixed(1)}%</span>
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-300/80">Revenue por Recompras</p>
                <p className="text-2xl font-bold text-emerald-400">{repurchaseRevenueShare.toFixed(1)}%</p>
              </div>
              <div className="rounded-full bg-emerald-500/20 p-3">
                <Layers className="h-5 w-5 text-emerald-400" />
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {formatCurrencyShort(revenueMetrics.totalRepurchaseRevenue)} de {formatCurrencyShort(revenueMetrics.totalRevenue)}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-violet-500/10 to-violet-600/5 border-violet-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-violet-300/80">Mejor Cohorte (LTV)</p>
                <p className="text-2xl font-bold text-violet-400">{bestCohort?.cohort || '-'}</p>
              </div>
              <div className="rounded-full bg-violet-500/20 p-3">
                <ArrowUpRight className="h-5 w-5 text-violet-400" />
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              LTV 6M: {formatCurrency(bestCohort?.ltv6m || 0)}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-300/80">Incremento AOV</p>
                <p className="text-2xl font-bold text-amber-400">
                  {orderMetrics.aov1 > 0 
                    ? `+${(((orderMetrics.aov4 - orderMetrics.aov1) / orderMetrics.aov1) * 100).toFixed(0)}%`
                    : '-'
                  }
                </p>
              </div>
              <div className="rounded-full bg-amber-500/20 p-3">
                <TrendingUp className="h-5 w-5 text-amber-400" />
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              De 1ra ({formatCurrencyShort(orderMetrics.aov1)}) a 4ta ({formatCurrencyShort(orderMetrics.aov4)})
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Curvas de LTV por Cohorte */}
      <Card className="bg-card border">
        <CardHeader>
          <CardTitle className="text-base font-medium text-foreground flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-400" />
            Curvas de Crecimiento LTV por Cohorte
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Evolucion del valor de vida del cliente en el tiempo
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ltvGrowthData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis 
                  dataKey="label" 
                  stroke="#666"
                  fontSize={12}
                />
                <YAxis 
                  tickFormatter={(v) => formatCurrencyShort(v)}
                  stroke="#666"
                  fontSize={12}
                />
                <Tooltip 
                  formatter={(value: number, name: string) => [formatCurrency(value), `Cohorte ${name}`]}
                  contentStyle={{ 
                    backgroundColor: '#1a1a1a', 
                    border: '1px solid #333',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#999' }}
                />
                <Legend 
                  formatter={(value) => <span className="text-muted-foreground text-xs">{value}</span>}
                />
                {selectedCohorts.map((cohort, index) => (
                  <Line
                    key={cohort.cohort}
                    type="monotone"
                    dataKey={cohort.cohort}
                    stroke={COHORT_COLORS[index % COHORT_COLORS.length]}
                    strokeWidth={2}
                    dot={{ r: 4, fill: COHORT_COLORS[index % COHORT_COLORS.length] }}
                    activeDot={{ r: 6 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* Acumulacion de Revenue y Contribucion */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Acumulado por Cohorte */}
        <Card className="bg-card border">
          <CardHeader>
            <CardTitle className="text-base font-medium text-foreground flex items-center gap-2">
              <Layers className="h-4 w-4 text-emerald-400" />
              Revenue Acumulado por Cohorte
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Acumulacion mensual de revenue desde primera compra
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueAccumulationByMonth} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#666"
                    fontSize={11}
                  />
                  <YAxis 
                    tickFormatter={(v) => formatCurrencyShort(v)}
                    stroke="#666"
                    fontSize={11}
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => [formatCurrency(value), name]}
                    contentStyle={{ 
                      backgroundColor: '#1a1a1a', 
                      border: '1px solid #333',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: '#999' }}
                  />
                  {selectedCohorts.slice(0, 4).map((cohort, index) => (
                    <Area
                      key={cohort.cohort}
                      type="monotone"
                      dataKey={cohort.cohort}
                      stackId="1"
                      stroke={COHORT_COLORS[index % COHORT_COLORS.length]}
                      fill={COHORT_COLORS[index % COHORT_COLORS.length]}
                      fillOpacity={0.3}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Contribucion Primera Compra vs Recompras */}
        <Card className="bg-card border">
          <CardHeader>
            <CardTitle className="text-base font-medium text-foreground flex items-center gap-2">
              <Target className="h-4 w-4 text-violet-400" />
              Composicion de Revenue por Cohorte
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Primera compra vs recompras
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={repurchaseContribution} layout="vertical" margin={{ top: 10, right: 30, left: 60, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={true} vertical={false} />
                  <XAxis 
                    type="number"
                    tickFormatter={(v) => formatCurrencyShort(v)}
                    stroke="#666"
                    fontSize={11}
                  />
                  <YAxis 
                    type="category"
                    dataKey="cohort"
                    stroke="#666"
                    fontSize={11}
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      formatCurrency(value), 
                      name === 'firstPurchase' ? '1ra Compra' : 'Recompras'
                    ]}
                    contentStyle={{ 
                      backgroundColor: '#1a1a1a', 
                      border: '1px solid #333',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: '#999' }}
                  />
                  <Legend 
                    formatter={(value) => value === 'firstPurchase' ? '1ra Compra' : 'Recompras'}
                  />
                  <Bar dataKey="firstPurchase" stackId="a" fill="#6366f1" name="firstPurchase" />
                  <Bar dataKey="repurchase" stackId="a" fill="#10b981" name="repurchase" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Tarjetas de Compra: 1ra, 2da, 3ra, 4ta */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {revenueComposition.map((item) => (
          <div key={item.purchase} className="rounded-lg bg-muted/30 p-4 text-center border border/50">
            <div className="text-sm text-muted-foreground">{item.purchase} Compra</div>
            <div className="mt-1 text-lg font-bold text-foreground">{formatCurrency(item.aov)}</div>
            <div className="mt-2 text-xs text-muted-foreground">
              <div>{item.customers.toLocaleString()} clientes</div>
              <div className="text-accent mt-1">{item.percent.toFixed(1)}% del revenue</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
