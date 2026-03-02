'use client'

import { useData } from '@/components/layout/data-provider'
import { RecencyCards } from '@/components/dashboard/recency-cards'
import { RevenueMetricsComponent } from '@/components/dashboard/revenue-metrics'
import { CustomerHealth } from '@/components/dashboard/customer-health'
import { SegmentContext } from '@/components/dashboard/segment-context'
import { WhatCustomersBuyNext } from '@/components/dashboard/what-customers-buy-next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrendingUp, TrendingDown, Minus, Download } from 'lucide-react'
import { useState } from 'react'
import { CustomerSegmentDistribution } from '@/components/dashboard/customer-segment-distribution' // Import CustomerSegmentDistribution
import { RevenueBySegment } from '@/components/dashboard/revenue-by-segment' // Import RevenueBySegment

export default function CustomersPage() {
  const { analysis } = useData()
  const [exportingMomentum, setExportingMomentum] = useState<string | null>(null)

  if (!analysis) {
    return null
  }

  const handleExportMomentum = async (momentumType: string) => {
    setExportingMomentum(momentumType)
    try {
      const response = await fetch('/api/exports/rfm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customers: analysis.customers,
          momentum: momentumType
        })
      })
      
      if (!response.ok) throw new Error('Export failed')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `momentum_${momentumType.toLowerCase()}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Export error:', error)
    } finally {
      setExportingMomentum(null)
    }
  }

  // Analyze customer momentum (accelerating, stable, slowing)
  const momentum = { accelerating: 0, stable: 0, slowing: 0 }
  
  for (const customer of analysis.customers) {
    if (customer.purchases.length < 2) continue
    
    const sortedPurchases = [...customer.purchases].sort((a, b) => 
      new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime()
    )
    
    const midpoint = Math.floor(sortedPurchases.length / 2)
    const firstHalf = sortedPurchases.slice(0, midpoint)
    const secondHalf = sortedPurchases.slice(midpoint)
    
    const firstHalfAvg = firstHalf.reduce((sum, p) => sum + p.amount, 0) / firstHalf.length
    const secondHalfAvg = secondHalf.reduce((sum, p) => sum + p.amount, 0) / secondHalf.length
    
    const change = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100
    
    if (change > 10) momentum.accelerating++
    else if (change < -10) momentum.slowing++
    else momentum.stable++
  }

  const totalCustomers = momentum.accelerating + momentum.stable + momentum.slowing
  const acceleratingPct = totalCustomers > 0 ? ((momentum.accelerating / totalCustomers) * 100).toFixed(1) : 0
  const stablePct = totalCustomers > 0 ? ((momentum.stable / totalCustomers) * 100).toFixed(1) : 0
  const slowingPct = totalCustomers > 0 ? ((momentum.slowing / totalCustomers) * 100).toFixed(1) : 0

  return (
    <div className="space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Clientes</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          ¿Quién sostiene el negocio? Recencia, valor y segmentación de clientes
        </p>
      </div>

      {/* Customer Health State */}
      <div>
        <CustomerHealth analysis={analysis} />
      </div>

      {/* Customer Momentum */}
      <Card className="border-border/50 bg-card">
        <CardHeader>
          <CardTitle className="text-base font-medium text-foreground">
            🟠 Customer Momentum
          </CardTitle>
          <p className="mt-2 text-xs text-muted-foreground">
            Clasificación de clientes según la tendencia de gasto entre primera y segunda mitad de sus compras
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            {/* Accelerating */}
            <div className="rounded-lg border-bordergreen-500/30 bg-green-500/5 p-4 relative">
              <div className="absolute top-4 right-4">
                <Button 
                  size="sm"
                  variant="outline"
                  onClick={() => handleExportMomentum('Accelerating')}
                  disabled={exportingMomentum === 'Accelerating'}
                  className="gap-1"
                >
                  <Download className="h-3 w-3" />
                  CSV
                </Button>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <span className="text-sm font-semibold text-foreground">Accelerating</span>
              </div>
              <div className="text-2xl font-bold text-green-500">{momentum.accelerating}</div>
              <div className="text-xs text-muted-foreground mt-1">{acceleratingPct}% del total</div>
              <p className="text-xs text-muted-foreground mt-2">Gasto aumentando &gt;10% entre periodos</p>
            </div>

            {/* Stable */}
            <div className="rounded-lg border-borderblue-500/30 bg-blue-500/5 p-4 relative">
              <div className="absolute top-4 right-4">
                <Button 
                  size="sm"
                  variant="outline"
                  onClick={() => handleExportMomentum('Stable')}
                  disabled={exportingMomentum === 'Stable'}
                  className="gap-1"
                >
                  <Download className="h-3 w-3" />
                  CSV
                </Button>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Minus className="h-5 w-5 text-blue-500" />
                <span className="text-sm font-semibold text-foreground">Stable</span>
              </div>
              <div className="text-2xl font-bold text-blue-500">{momentum.stable}</div>
              <div className="text-xs text-muted-foreground mt-1">{stablePct}% del total</div>
              <p className="text-xs text-muted-foreground mt-2">Gasto consistente ±10%</p>
            </div>

            {/* Slowing */}
            <div className="rounded-lg border-borderred-500/30 bg-red-500/5 p-4 relative">
              <div className="absolute top-4 right-4">
                <Button 
                  size="sm"
                  variant="outline"
                  onClick={() => handleExportMomentum('Slowing')}
                  disabled={exportingMomentum === 'Slowing'}
                  className="gap-1"
                >
                  <Download className="h-3 w-3" />
                  CSV
                </Button>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="h-5 w-5 text-red-500" />
                <span className="text-sm font-semibold text-foreground">Slowing</span>
              </div>
              <div className="text-2xl font-bold text-red-500">{momentum.slowing}</div>
              <div className="text-xs text-muted-foreground mt-1">{slowingPct}% del total</div>
              <p className="text-xs text-muted-foreground mt-2">Gasto disminuyendo &gt;10% entre periodos</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Segment Context - Narrative Explanations */}
      <SegmentContext segments={analysis.rfmAnalysis.segments} />

      {/* Next Purchase Behavior Intelligence */}
      <WhatCustomersBuyNext topNextPurchases={analysis.nextPurchaseIntelligence.top_next_purchases} />

      {/* Recency Metrics */}
      <RecencyCards recencyMetrics={analysis.recencyMetrics} />

      {/* Revenue by Customer */}
      <RevenueMetricsComponent revenueMetrics={analysis.revenueMetrics} />
    </div>
  )
}
