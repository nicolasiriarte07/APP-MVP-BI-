'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { PurchaseOrderMetrics } from '@/lib/types'
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Cell,
  Line,
  ComposedChart,
  Legend,
} from 'recharts'
import { ShoppingCart, TrendingDown, Users, DollarSign } from 'lucide-react'

interface OrderMetricsProps {
  orderMetrics: PurchaseOrderMetrics
}

export function OrderMetricsComponent({ orderMetrics }: OrderMetricsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Datos para grafico de AOV por numero de compra
  const aovData = [
    { 
      name: '1ra Compra', 
      aov: orderMetrics.aov1, 
      customers: orderMetrics.customers1,
      fill: '#3b82f6' 
    },
    { 
      name: '2da Compra', 
      aov: orderMetrics.aov2, 
      customers: orderMetrics.customers2,
      fill: '#06b6d4' 
    },
    { 
      name: '3ra Compra', 
      aov: orderMetrics.aov3, 
      customers: orderMetrics.customers3,
      fill: '#10b981' 
    },
    { 
      name: '4ta Compra', 
      aov: orderMetrics.aov4, 
      customers: orderMetrics.customers4,
      fill: '#8b5cf6' 
    },
    { 
      name: '5ta Compra', 
      aov: orderMetrics.aov5, 
      customers: orderMetrics.customers5,
      fill: '#f59e0b' 
    },
  ]

  // Datos para grafico de funnel (clientes por numero de compra)
  const funnelData = [
    { 
      name: '1ra', 
      fullName: '1ra Compra',
      customers: orderMetrics.customers1, 
      percent: 100,
      fill: '#3b82f6' 
    },
    { 
      name: '2da', 
      fullName: '2da Compra',
      customers: orderMetrics.customers2, 
      percent: orderMetrics.retention1to2,
      fill: '#06b6d4' 
    },
    { 
      name: '3ra', 
      fullName: '3ra Compra',
      customers: orderMetrics.customers3, 
      percent: orderMetrics.customers1 > 0 ? (orderMetrics.customers3 / orderMetrics.customers1) * 100 : 0,
      fill: '#10b981' 
    },
    { 
      name: '4ta', 
      fullName: '4ta Compra',
      customers: orderMetrics.customers4, 
      percent: orderMetrics.customers1 > 0 ? (orderMetrics.customers4 / orderMetrics.customers1) * 100 : 0,
      fill: '#8b5cf6' 
    },
    { 
      name: '5ta', 
      fullName: '5ta Compra',
      customers: orderMetrics.customers5, 
      percent: orderMetrics.customers1 > 0 ? (orderMetrics.customers5 / orderMetrics.customers1) * 100 : 0,
      fill: '#f59e0b' 
    },
  ]

  // Datos para grafico combinado de drop-off y retention
  const retentionData = [
    { 
      transition: '1ra a 2da', 
      retention: orderMetrics.retention1to2, 
      dropoff: orderMetrics.dropoff1to2 
    },
    { 
      transition: '2da a 3ra', 
      retention: orderMetrics.retention2to3, 
      dropoff: orderMetrics.dropoff2to3 
    },
    { 
      transition: '3ra a 4ta', 
      retention: orderMetrics.retention3to4, 
      dropoff: orderMetrics.dropoff3to4 
    },
    { 
      transition: '4ta a 5ta', 
      retention: orderMetrics.retention4to5, 
      dropoff: orderMetrics.dropoff4to5 
    },
  ]

  return (
    <div className="space-y-6">
      {/* Titulo de seccion */}
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-blue-500/10 p-2">
          <ShoppingCart className="h-5 w-5 text-blue-500" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">Metricas por Numero de Compra</h2>
          <p className="text-sm text-muted-foreground">
            Ticket promedio y conversion por orden de compra
          </p>
        </div>
      </div>

      {/* KPIs de AOV */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-card border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-blue-500" />
              Ticket 1ra Compra
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              {formatCurrency(orderMetrics.aov1)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {orderMetrics.customers1.toLocaleString()} clientes
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-cyan-500" />
              Ticket 2da Compra
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cyan-500">
              {formatCurrency(orderMetrics.aov2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {orderMetrics.customers2.toLocaleString()} clientes
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-emerald-500" />
              Ticket 3ra Compra
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">
              {formatCurrency(orderMetrics.aov3)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {orderMetrics.customers3.toLocaleString()} clientes
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-violet-500" />
              Ticket 4ta Compra
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-violet-500">
              {formatCurrency(orderMetrics.aov4)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {orderMetrics.customers4.toLocaleString()} clientes
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-rose-500" />
              Ticket 5ta Compra
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-500">
              {formatCurrency(orderMetrics.aov5)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {orderMetrics.customers5.toLocaleString()} clientes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* KPIs de Drop-off */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-orange-500" />
              Drop-off 1ra a 2da
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-orange-500">
                {orderMetrics.dropoff1to2.toFixed(1)}%
              </span>
              <span className="text-sm text-muted-foreground">
                no recompra
              </span>
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-muted overflow-hidden">
              <div 
                className="h-full bg-cyan-500 rounded-full transition-all"
                style={{ width: `${orderMetrics.retention1to2}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {orderMetrics.retention1to2.toFixed(1)}% retencion
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-orange-500" />
              Drop-off 2da a 3ra
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-orange-500">
                {orderMetrics.dropoff2to3.toFixed(1)}%
              </span>
              <span className="text-sm text-muted-foreground">
                no recompra
              </span>
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-muted overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: `${orderMetrics.retention2to3}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {orderMetrics.retention2to3.toFixed(1)}% retencion
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-orange-500" />
              Drop-off 3ra a 4ta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-orange-500">
                {orderMetrics.dropoff3to4.toFixed(1)}%
              </span>
              <span className="text-sm text-muted-foreground">
                no recompra
              </span>
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-muted overflow-hidden">
              <div 
                className="h-full bg-violet-500 rounded-full transition-all"
                style={{ width: `${orderMetrics.retention3to4}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {orderMetrics.retention3to4.toFixed(1)}% retencion
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-orange-500" />
              Drop-off 4ta a 5ta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-orange-500">
                {orderMetrics.dropoff4to5.toFixed(1)}%
              </span>
              <span className="text-sm text-muted-foreground">
                no recompra
              </span>
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-muted overflow-hidden">
              <div 
                className="h-full bg-rose-500 rounded-full transition-all"
                style={{ width: `${orderMetrics.retention4to5}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {orderMetrics.retention4to5.toFixed(1)}% retencion
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Graficos */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Grafico de AOV por numero de compra */}
        <Card className="bg-card border">
          <CardHeader>
            <CardTitle className="text-base font-medium text-foreground">
              Ticket Promedio por Numero de Compra
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={aovData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: '#888', fontSize: 12 }}
                    axisLine={{ stroke: '#444' }}
                  />
                  <YAxis 
                    tick={{ fill: '#888', fontSize: 12 }}
                    axisLine={{ stroke: '#444' }}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), 'AOV']}
                    contentStyle={{ 
                      backgroundColor: '#1a1a1a', 
                      border: '1px solid #333',
                      borderRadius: '8px'
                    }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="aov" radius={[4, 4, 0, 0]}>
                    {aovData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Grafico de Funnel de clientes */}
        <Card className="bg-card border">
          <CardHeader>
            <CardTitle className="text-base font-medium text-foreground flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              Funnel de Clientes por Compra
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: '#888', fontSize: 12 }}
                    axisLine={{ stroke: '#444' }}
                  />
                  <YAxis 
                    tick={{ fill: '#888', fontSize: 12 }}
                    axisLine={{ stroke: '#444' }}
                    tickFormatter={(value) => value.toLocaleString()}
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => {
                      if (name === 'customers') return [value.toLocaleString(), 'Clientes']
                      return [value, name]
                    }}
                    contentStyle={{ 
                      backgroundColor: '#1a1a1a', 
                      border: '1px solid #333',
                      borderRadius: '8px'
                    }}
                    labelStyle={{ color: '#fff' }}
                    labelFormatter={(label) => {
                      const item = funnelData.find(d => d.name === label)
                      return item?.fullName || label
                    }}
                  />
                  <Bar dataKey="customers" radius={[4, 4, 0, 0]}>
                    {funnelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex justify-center gap-6">
              {funnelData.map((item) => (
                <div key={item.name} className="text-center">
                  <div className="text-xs text-muted-foreground">{item.fullName}</div>
                  <div className="text-sm font-medium" style={{ color: item.fill }}>
                    {item.percent.toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grafico de Retention vs Drop-off */}
      <Card className="bg-card border">
        <CardHeader>
          <CardTitle className="text-base font-medium text-foreground">
            Retencion vs Drop-off entre Compras
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={retentionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis 
                  dataKey="transition" 
                  tick={{ fill: '#888', fontSize: 12 }}
                  axisLine={{ stroke: '#444' }}
                />
                <YAxis 
                  tick={{ fill: '#888', fontSize: 12 }}
                  axisLine={{ stroke: '#444' }}
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    `${value.toFixed(1)}%`, 
                    name === 'retention' ? 'Retencion' : 'Drop-off'
                  ]}
                  contentStyle={{ 
                    backgroundColor: '#1a1a1a', 
                    border: '1px solid #333',
                    borderRadius: '8px'
                  }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend 
                  formatter={(value) => value === 'retention' ? 'Retencion' : 'Drop-off'}
                  wrapperStyle={{ color: '#888' }}
                />
                <Bar dataKey="retention" fill="#10b981" radius={[4, 4, 0, 0]} name="retention" />
                <Line 
                  type="monotone" 
                  dataKey="dropoff" 
                  stroke="#f97316" 
                  strokeWidth={2}
                  dot={{ fill: '#f97316', r: 4 }}
                  name="dropoff"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
