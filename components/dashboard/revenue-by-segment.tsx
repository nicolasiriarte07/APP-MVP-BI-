'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { SegmentSummary } from '@/lib/types'

interface RevenueBySegmentProps {
  segments: SegmentSummary[]
}

const segmentColors: Record<string, string> = {
  'Loyal': '#00ff88',
  'Potential': '#00bbff',
  'At Risk': '#ffbb00',
  'Lost': '#ff4444'
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

export function RevenueBySegment({ segments }: RevenueBySegmentProps) {
  const totalCustomers = segments.reduce((sum, s) => sum + s.customer_count, 0)
  
  const revenueData = segments.map(s => ({
    segment: s.segment,
    revenue: s.total_revenue,
    share: Math.round(s.revenue_share),
    customers: s.customer_count,
    customerPercent: totalCustomers > 0 ? Math.round((s.customer_count / totalCustomers) * 100) : 0,
    avg_per_customer: s.avg_revenue_per_customer
  }))

  const totalRevenue = segments.reduce((sum, s) => sum + s.total_revenue, 0)

  return (
    <Card className="border/50 bg-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium text-foreground">Ingresos por Segmento</CardTitle>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-lg font-bold text-accent">{formatCurrency(totalRevenue)}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444444" vertical={false} />
              <XAxis dataKey="segment" stroke="#999999" fontSize={12} />
              <YAxis 
                stroke="#999999" 
                fontSize={12}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ 
                  backgroundColor: '#333333', 
                  border: '1px solid #444444',
                  borderRadius: '8px'
                }}
                labelStyle={{ color: '#ffffff' }}
              />
              <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                {revenueData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={segmentColors[entry.segment]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Segment Details Table */}
        <div className="space-y-2 border-t border/30 pt-4">
          {revenueData.map((data) => (
            <div key={data.segment} className="flex items-center justify-between rounded-lg bg-secondary/30 p-3">
              <div className="flex items-center gap-3">
                <div 
                  className="h-3 w-3 rounded-full" 
                  style={{ backgroundColor: segmentColors[data.segment] }}
                />
                <div>
                  <p className="text-sm font-medium text-foreground">{data.segment}</p>
                  <p className="text-xs text-muted-foreground">{data.customers} clientes <span className="text-accent">({data.customerPercent}%)</span></p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">{formatCurrency(data.revenue)}</p>
                <p className="text-xs text-accent">{data.share}% del total</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
