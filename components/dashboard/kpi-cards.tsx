'use client'

import { CohortAnalysis } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { DollarSign, Users, Target, TrendingUp, AlertTriangle } from 'lucide-react'

interface KPICardsProps {
  analysis: CohortAnalysis
}

export function KPICards({ analysis }: KPICardsProps) {
  // Format currency
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  // Calculate total revenue from all customers
  const totalRevenue = analysis.customers.reduce((sum, customer) => {
    return sum + customer.purchases.reduce((custSum, purchase) => custSum + purchase.amount, 0)
  }, 0)

  // Use direct values from analysis (calculated from complete purchase history)
  const peakMonth = analysis.peakRepurchaseMonth > 0 ? `M${analysis.peakRepurchaseMonth}` : 'No hay datos'
  const peakRate = analysis.peakRepurchaseRate
  const peakMonthIndex = analysis.peakRepurchaseMonthIndex // Declare the variable

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* 1. Total Revenue */}
      <Card className="border/50 bg-card">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Ingresos Totales
              </p>
              <p className="text-3xl font-bold tracking-tight">
                {formatCurrency(totalRevenue)}
              </p>
              <p className="text-xs text-muted-foreground">
                Período seleccionado
              </p>
            </div>
            <div className="rounded-lg bg-accent/10 p-2.5">
              <DollarSign className="h-5 w-5 text-accent" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Peak Repurchase Month */}
      <Card className="border/50 bg-card">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Mes Pico de Recompra
              </p>
              <p className="text-3xl font-bold tracking-tight">
                {peakMonth}
              </p>
              <p className="text-xs text-muted-foreground">
                {analysis.peakRepurchaseMonth > 0 ? `${peakRate.toFixed(1)}% tasa promedio` : 'Datos insuficientes'}
              </p>
            </div>
            <div className="rounded-lg bg-chart-2/10 p-2.5">
              <Target className="h-5 w-5 text-chart-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Global Repurchase Rate */}
      <Card className="border/50 bg-card">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Tasa de Recompra Global
              </p>
              <p className="text-3xl font-bold tracking-tight">
                {analysis.globalRepurchaseRate.toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground">
                Clientes con 2+ compras
              </p>
            </div>
            <div className="rounded-lg bg-emerald-500/10 p-2.5">
              <Users className="h-5 w-5 text-emerald-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. Customer Base */}
      <Card className="border/50 bg-card">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Base de Clientes
              </p>
              <p className="text-3xl font-bold tracking-tight">
                {analysis.totalCustomers.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                {analysis.totalOrders.toLocaleString()} órdenes totales
              </p>
            </div>
            <div className="rounded-lg bg-chart-4/10 p-2.5">
              <Target className="h-5 w-5 text-chart-4" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
