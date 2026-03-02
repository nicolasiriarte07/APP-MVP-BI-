'use client'

import { useState, useMemo } from 'react'
import { useData } from '@/components/layout/data-provider'
import { KPICards } from '@/components/dashboard/kpi-cards'
import { BusinessInsights } from '@/components/dashboard/business-insights'
import { ExecutiveInsights } from '@/components/dashboard/executive-insights'
import { ExecutiveNarrativeComponent } from '@/components/dashboard/executive-narrative'
import { DateRangeFilter } from '@/components/dashboard/date-range-filter'
import { generateExecutiveNarrative } from '@/lib/narrative-utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RotateCcw, AlertCircle, Zap } from 'lucide-react'

export default function HomePage() {
  const { analysis, onReset } = useData()
  const [dateFilterStart, setDateFilterStart] = useState<Date | null>(null)
  const [dateFilterEnd, setDateFilterEnd] = useState<Date | null>(null)

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  // Calculate filtered metrics based on date range
  const filteredMetrics = useMemo(() => {
    if (!analysis) {
      return null
    }

    if (!dateFilterStart || !dateFilterEnd) {
      return null
    }

    // Filter customers and purchases within date range
    const filteredRevenue = analysis.customers.reduce((sum, customer) => {
      return sum + customer.purchases
        .filter(p => {
          const purchaseDate = new Date(p.paymentDate)
          return purchaseDate >= dateFilterStart && purchaseDate <= dateFilterEnd
        })
        .reduce((custSum, purchase) => custSum + purchase.amount, 0)
    }, 0)

    // Count unique customers with purchases in date range
    const customersInRange = new Set<string>()
    analysis.customers.forEach(customer => {
      const hasPurchaseInRange = customer.purchases.some(p => {
        const purchaseDate = new Date(p.paymentDate)
        return purchaseDate >= dateFilterStart && purchaseDate <= dateFilterEnd
      })
      if (hasPurchaseInRange) {
        customersInRange.add(customer.email)
      }
    })

    // Calculate Recurrencia en el periodo (customers with 2+ purchases IN the period)
    const recurrenceInPeriod = Array.from(customersInRange).filter(email => {
      const customer = analysis.customers.find(c => c.email === email)
      const purchasesInRange = customer?.purchases.filter(p => {
        const purchaseDate = new Date(p.paymentDate)
        return purchaseDate >= dateFilterStart && purchaseDate <= dateFilterEnd
      }) || []
      return purchasesInRange.length > 1
    }).length

    const recurrenceRate = customersInRange.size > 0 ? (recurrenceInPeriod / customersInRange.size) * 100 : 0

    // Calculate Tasa de Recompra Global (historical - customers with 2+ total purchases / all customers)
    const customersWithRepurchase = analysis.customers.filter(c => c.purchases.length >= 2).length
    const totalCustomers = analysis.customers.length
    const globalRepurchaseRate = totalCustomers > 0 ? (customersWithRepurchase / totalCustomers) * 100 : 0

    // Count total orders in period
    const totalOrdersInPeriod = Array.from(customersInRange).reduce((sum, email) => {
      const customer = analysis.customers.find(c => c.email === email)
      const ordersInPeriod = customer?.purchases.filter(p => {
        const purchaseDate = new Date(p.paymentDate)
        return purchaseDate >= dateFilterStart && purchaseDate <= dateFilterEnd
      }).length || 0
      return sum + ordersInPeriod
    }, 0)

    return {
      totalRevenue: filteredRevenue,
      customerBase: customersInRange.size,
      recurrenceInPeriod: recurrenceRate,
      globalRepurchaseRate: globalRepurchaseRate,
      totalOrders: totalOrdersInPeriod
    }
  }, [dateFilterStart, dateFilterEnd, analysis])

  const handleDateRangeChange = (start: Date, end: Date) => {
    setDateFilterStart(start)
    setDateFilterEnd(end)
  }

  // Generate RFM-based insights
  const loyalSegment = analysis?.rfmAnalysis?.segments.find(s => s.segment === 'Loyal')
  const atRiskSegment = analysis?.rfmAnalysis?.segments.find(s => s.segment === 'At Risk')
  const potentialSegment = analysis?.rfmAnalysis?.segments.find(s => s.segment === 'Potential')

  // Calculate total revenue from all customers
  const totalRevenue = analysis?.customers.reduce((sum, customer) => {
    return sum + customer.purchases.reduce((custSum, purchase) => custSum + purchase.amount, 0)
  }, 0) || 0

  // Calculate revenue at risk
  const slowingMomentum = analysis?.customers
    .filter(c => c.momentum_segment === 'Slowing')
    .reduce((sum, customer) => {
      return sum + customer.purchases.reduce((custSum, purchase) => custSum + purchase.amount, 0)
    }, 0) || 0
  
  const totalAtRiskRevenue = (atRiskSegment?.total_revenue || 0) + slowingMomentum

  if (!analysis) {
    return null
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-4 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Centro de Decisiones</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Rango de datos: {formatDate(analysis.startDate)} - {formatDate(analysis.endDate)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {dateFilterStart && dateFilterEnd && (
            <div className="text-xs text-muted-foreground bg-background/50 px-3 py-2 rounded-lg">
              Filtro: {formatDate(dateFilterStart)} - {formatDate(dateFilterEnd)}
            </div>
          )}
          <DateRangeFilter onRangeChange={handleDateRangeChange} defaultPreset="last6m" />
          <Button variant="outline" size="sm" onClick={onReset} className="gap-2 bg-transparent">
            <RotateCcw className="h-4 w-4" />
            Cargar Nuevos Datos
          </Button>
        </div>
      </div>

      {/* Filtered Metrics Card */}
      {filteredMetrics && (
        <div className="px-4 sm:px-6 lg:px-8">
          <Card className="border-accent/30 bg-card">
            <CardHeader>
              <CardTitle className="text-base">Métricas Filtradas por Rango de Fechas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border bg-background/50 p-4">
                  <p className="text-sm font-medium text-muted-foreground">Ingresos Totales</p>
                  <p className="mt-2 text-2xl font-bold text-accent">{formatCurrency(filteredMetrics.totalRevenue)}</p>
                </div>
                <div className="rounded-lg border bg-background/50 p-4">
                  <p className="text-sm font-medium text-muted-foreground">Tasa de Recurrencia</p>
                  <p className="mt-2 text-2xl font-bold text-accent">{filteredMetrics.recurrenceInPeriod.toFixed(1)}%</p>
                </div>
                <div className="rounded-lg border bg-background/50 p-4">
                  <p className="text-sm font-medium text-muted-foreground">Tasa de Recompra Global</p>
                  <p className="mt-2 text-2xl font-bold text-accent">{filteredMetrics.globalRepurchaseRate.toFixed(1)}%</p>
                </div>
                <div className="rounded-lg border bg-background/50 p-4">
                  <p className="text-sm font-medium text-muted-foreground">Base de Clientes / Órdenes</p>
                  <p className="mt-2 text-2xl font-bold text-accent">{filteredMetrics.customerBase} / {filteredMetrics.totalOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Executive Summary Line */}
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-gradient-to-r from-background to-background/80 border border-border/30 px-4 py-3">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {atRiskSegment && (atRiskSegment.percentage_of_customers > 15 || (totalAtRiskRevenue / totalRevenue > 0.2)) ? (
              <>
                <span className="font-semibold text-amber-600">⚠️ Retención es tu mayor palanca de crecimiento hoy.</span> {' '}
                {(totalAtRiskRevenue / totalRevenue * 100).toFixed(0)}% de ingresos está en riesgo de churn — requiere intervención inmediata.
              </>
            ) : (
              <>
                <span className="font-semibold text-accent">✓ Base estable.</span> {' '}
                Enfócate en consolidar los {loyalSegment?.customer_count} clientes leales que generan {loyalSegment?.revenue_share.toFixed(0)}% de ingresos.
              </>
            )}
          </p>
        </div>
      </div>

      {/* Customer Intelligence Snapshot */}
      {loyalSegment && (
        <div className="px-4 sm:px-6 lg:px-8">
          <Card className="border-accent/30 bg-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-accent uppercase tracking-wide">Panorama de Inteligencia de Clientes</p>
                  <CardTitle className="mt-1 flex items-center gap-2 text-base font-semibold text-foreground">
                    <Zap className="h-5 w-5 text-accent" />
                    Inteligencia de Clientes
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                {/* Loyal customers insight */}
                <div className="rounded-lg border border-accent/20 bg-background p-4">
                  <p className="text-sm font-medium text-muted-foreground">Clientes Leales</p>
                  <p className="mt-2 text-xl font-bold text-accent">{loyalSegment.revenue_share.toFixed(1)}%</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {loyalSegment.customer_count} clientes generan {formatCurrency(loyalSegment.total_revenue)}
                  </p>
                </div>

                {/* At Risk alert */}
                {atRiskSegment && atRiskSegment.percentage_of_customers > 15 && (
                  <div className="rounded-lg border border-warning/20 bg-background p-4">
                    <p className="flex items-center gap-2 text-sm font-medium text-warning">
                      <AlertCircle className="h-4 w-4" />
                      En Riesgo
                    </p>
                    <p className="mt-2 text-xl font-bold text-warning">{atRiskSegment.percentage_of_customers.toFixed(1)}%</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {atRiskSegment.customer_count} clientes representan {formatCurrency(atRiskSegment.total_revenue)}
                    </p>
                  </div>
                )}

                {/* Potential growth insight */}
                {potentialSegment && (
                  <div className="rounded-lg border border-chart-2/20 bg-background p-4">
                    <p className="text-sm font-medium text-muted-foreground">Potencial de Crecimiento</p>
                    <p className="mt-2 text-xl font-bold text-chart-2">{potentialSegment.avg_revenue_per_customer.toFixed(0)}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Ingresos promedio por cliente en {potentialSegment.customer_count} oportunidades
                    </p>
                  </div>
                )}
              </div>

              {/* Strategic narrative */}
              <div className="rounded-lg bg-background/50 p-4 text-sm text-muted-foreground border border-border/30">
                <p className="leading-relaxed">
                  {loyalSegment && loyalSegment.revenue_share > 50 ? (
                    <>
                      👉 <span className="font-semibold text-foreground">La consolidación de clientes leales es tu mayor palanca de crecimiento hoy.</span> {' '}
                      <span className="font-semibold text-accent">{loyalSegment.revenue_share.toFixed(0)}% de tus ingresos</span> provienen de{' '}
                      <span className="font-semibold text-accent">{loyalSegment.percentage_of_customers.toFixed(0)}% de tus clientes</span>.
                      {atRiskSegment && atRiskSegment.percentage_of_customers > 20 && (
                        <>
                          {' '}Pero <span className="font-semibold text-warning">{atRiskSegment.percentage_of_customers.toFixed(0)}% está en riesgo</span> — requiere intervención estratégica.
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      👉 <span className="font-semibold text-foreground">Tu base está fragmentada, pero hay oportunidad clara.</span> {' '}
                      Enfócate en activar los {Math.max(potentialSegment?.customer_count || 0, loyalSegment.customer_count)} clientes con mayor potencial de retención.
                    </>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Business Health & Strategic Insights */}
      <div className="px-4 sm:px-6 lg:px-8">
        <BusinessInsights analysis={analysis} />
      </div>
      <div className="px-4 sm:px-6 lg:px-8">
        <ExecutiveInsights analysis={analysis} />
      </div>

      {/* Executive Narrative - Weekly Analysis */}
      <div className="px-4 sm:px-6 lg:px-8">
        <ExecutiveNarrativeComponent narrative={generateExecutiveNarrative(analysis)} />
      </div>
    </div>
  )
}
