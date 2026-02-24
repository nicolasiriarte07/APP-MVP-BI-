'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, TrendingUp, PieChart } from 'lucide-react'
import type { RevenueMetrics } from '@/lib/types'
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
  PieChart as RechartsPieChart,
  Pie,
} from 'recharts'

interface RevenueMetricsProps {
  revenueMetrics: RevenueMetrics
}

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

export function RevenueMetricsComponent({ revenueMetrics }: RevenueMetricsProps) {
  // Datos para grafico de LTV por ventana de tiempo
  const ltvData = [
    { name: '1 Mes', ltv: revenueMetrics.avgLtv1m, fill: '#3b82f6' },
    { name: '3 Meses', ltv: revenueMetrics.avgLtv3m, fill: '#06b6d4' },
    { name: '6 Meses', ltv: revenueMetrics.avgLtv6m, fill: '#10b981' },
    { name: '12 Meses', ltv: revenueMetrics.avgLtv12m, fill: '#8b5cf6' },
  ]
  
  // Datos para grafico de distribucion de revenue
  const revenueDistribution = [
    { name: '1ra Compra', value: revenueMetrics.totalFirstPurchaseRevenue, fill: '#6366f1' },
    { name: 'Recompras', value: revenueMetrics.totalRepurchaseRevenue, fill: '#10b981' },
  ]
  
  // Datos para grafico de acumulacion de revenue por mes
  const revenueAccumulation = [
    { label: 'Mes 1', revenue: revenueMetrics.avgRevenue1m },
    { label: 'Mes 2', revenue: revenueMetrics.avgRevenue2m },
    { label: 'Mes 3', revenue: revenueMetrics.avgRevenue3m },
    { label: 'Mes 4', revenue: revenueMetrics.avgRevenue4m },
    { label: 'Mes 5', revenue: revenueMetrics.avgRevenue5m },
    { label: 'Mes 6', revenue: revenueMetrics.avgRevenue6m },
  ]

  return (
    <div className="space-y-6">
      {/* Titulo de seccion */}
      <div className="flex items-center gap-2">
        <DollarSign className="h-5 w-5 text-emerald-500" />
        <h2 className="text-xl font-semibold text-foreground">Metricas de Revenue</h2>
      </div>
      
      {/* KPIs de Revenue */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card className="bg-card border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Revenue Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(revenueMetrics.totalRevenue)}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              LTV Promedio 6M
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">
              {formatCurrency(revenueMetrics.avgLtv6m)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              por cliente
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-card border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              LTV Promedio 12M
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-violet-500">
              {formatCurrency(revenueMetrics.avgLtv12m)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              por cliente
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-card border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Revenue 1ra Compra
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-400">
              {revenueMetrics.firstPurchasePercent.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatCurrencyShort(revenueMetrics.totalFirstPurchaseRevenue)}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-card border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Revenue Recompras
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-400">
              {revenueMetrics.repurchasePercent.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatCurrencyShort(revenueMetrics.totalRepurchaseRevenue)}
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Graficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LTV por Ventana de Tiempo */}
        <Card className="bg-card border">
          <CardHeader>
            <CardTitle className="text-base font-medium text-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-400" />
              LTV Promedio por Ventana de Tiempo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ltvData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={true} vertical={false} />
                  <XAxis 
                    type="number" 
                    tickFormatter={(v) => `$${v.toFixed(0)}`}
                    stroke="#666"
                    fontSize={12}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    stroke="#666"
                    fontSize={12}
                    width={70}
                  />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), 'LTV']}
                    contentStyle={{ 
                      backgroundColor: '#1a1a1a', 
                      border: '1px solid #333',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: '#999' }}
                  />
                  <Bar dataKey="ltv" radius={[0, 4, 4, 0]}>
                    {ltvData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Distribucion de Revenue */}
        <Card className="bg-card border">
          <CardHeader>
            <CardTitle className="text-base font-medium text-foreground flex items-center gap-2">
              <PieChart className="h-4 w-4 text-indigo-400" />
              Distribucion de Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={revenueDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    labelLine={false}
                  >
                    {revenueDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                    contentStyle={{ 
                      backgroundColor: '#1a1a1a', 
                      border: '1px solid #333',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value) => <span className="text-muted-foreground text-sm">{value}</span>}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      
    </div>
  )
}
