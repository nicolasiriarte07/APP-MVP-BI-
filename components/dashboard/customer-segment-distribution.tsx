'use client'

import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { SegmentSummary } from '@/lib/types'

interface CustomerSegmentDistributionProps {
  segments: SegmentSummary[]
}

const segmentColors: Record<string, string> = {
  'Loyal': '#00ff88',
  'Potential': '#00bbff',
  'At Risk': '#ffbb00',
  'Lost': '#ff4444'
}

export function CustomerSegmentDistribution({ segments }: CustomerSegmentDistributionProps) {
  const pieData = segments.map(s => ({
    name: s.segment,
    value: s.customer_count,
    percentage: s.percentage_of_customers
  }))

  const barData = segments.map(s => ({
    segment: s.segment,
    customers: s.customer_count,
    percentage: Math.round(s.percentage_of_customers)
  }))

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Donut Chart - Distribution */}
      <Card className="border/50 bg-card">
        <CardHeader>
          <CardTitle className="text-base font-medium text-foreground">Distribución de Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={segmentColors[entry.name]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number, name: string) => {
                    if (name === 'value') {
                      const segment = pieData.find(d => d.value === value)
                      return [`${value} clientes (${segment?.percentage.toFixed(1)}%)`, 'Clientes']
                    }
                    return [value, name]
                  }}
                  contentStyle={{ 
                    backgroundColor: '#333333', 
                    border: '1px solid #444444',
                    borderRadius: '8px'
                  }}
                  labelStyle={{ color: '#ffffff' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Bar Chart - Segment Details */}
      <Card className="border/50 bg-card">
        <CardHeader>
          <CardTitle className="text-base font-medium text-foreground">Clientes por Segmento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444444" vertical={false} />
                <XAxis dataKey="segment" stroke="#999999" fontSize={12} />
                <YAxis stroke="#999999" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#333333', 
                    border: '1px solid #444444',
                    borderRadius: '8px'
                  }}
                  labelStyle={{ color: '#ffffff' }}
                />
                <Bar dataKey="customers" radius={[4, 4, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={segmentColors[entry.segment]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
