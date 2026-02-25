'use client'

import { CohortAnalysis } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, AlertCircle, TrendingDown, TrendingUp } from 'lucide-react'
import { useState } from 'react'

interface CustomerHealthProps {
  analysis: CohortAnalysis
}

export function CustomerHealth({ analysis }: CustomerHealthProps) {
  const [exportingSegment, setExportingSegment] = useState<string | null>(null)

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('es-AR').format(Math.round(value))
  }

  // Segment using the status and subSegment fields assigned by health-segmentation.ts
  const activeCustomers = analysis.customers.filter(c => c.status === 'ACTIVO')
  const dormantCustomers = analysis.customers.filter(c => c.status === 'DORMIDO')

  const champions = activeCustomers.filter(c => c.subSegment === 'CHAMPIONS')
  const atRisk = activeCustomers.filter(c => c.subSegment === 'EN_RIESGO')
  const regular = activeCustomers.filter(c => c.subSegment === 'REGULARES')
  const recoverable = dormantCustomers.filter(c => c.subSegment === 'RECUPERABLES')
  const lost = dormantCustomers.filter(c => c.subSegment === 'INACTIVO')

  // Revenue: use full historical revenue from all purchases, not just last 3 months
  const getHistoricalRevenue = (customers: typeof analysis.customers) => {
    return customers.reduce((sum, c) => {
      return sum + c.purchases.reduce((custSum, p) => custSum + p.amount, 0)
    }, 0)
  }

  const activeRevenue = getHistoricalRevenue(activeCustomers)
  const dormantRevenue = getHistoricalRevenue(dormantCustomers)

  const handleExportSegment = async (segmentName: string, customers: typeof analysis.customers) => {
    setExportingSegment(segmentName)
    try {
      const headers = ['Email', 'Total Órdenes', 'LTV Total', 'Última Compra']
      const rows = customers.map(c => [
        c.email,
        c.totalOrders.toString(),
        c.purchases.reduce((sum, p) => sum + p.amount, 0).toFixed(2),
        new Date(c.purchases[c.purchases.length - 1]?.paymentDate || '').toLocaleDateString('es-AR')
      ])

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `customers_${segmentName.toLowerCase().replace(/\s+/g, '_')}.csv`
      document.body.appendChild(link)
      link.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(link)
    } finally {
      setExportingSegment(null)
    }
  }

  const totalCustomers = analysis.customers.length
  const activePercentage = (activeCustomers.length / totalCustomers) * 100
  const dormantPercentage = (dormantCustomers.length / totalCustomers) * 100

  const getRevenue = (customers: typeof analysis.customers) => {
    return customers.reduce((sum, c) => sum + c.purchases.reduce((custSum, p) => custSum + p.amount, 0), 0)
  }

  // Churn: dormant / total as a simple rate
  const churnRate = totalCustomers > 0 ? dormantCustomers.length / totalCustomers : 0
  const benchmarkChurn = 0.3
  const monthlyChurnCount = Math.round(atRisk.length * 0.15)
  const monthlyReactivations = Math.round(recoverable.length * 0.05)
  const netChange = monthlyReactivations - monthlyChurnCount

  return (
    <div className="space-y-8 bg-card border border rounded-2xl p-10" style={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)' }}>
      {/* Main Title */}
      <h1 className="text-4xl font-bold text-foreground">Salud de Base</h1>

      {/* SECTION 1: HERO - Overview */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Active Card */}
          <div className="relative rounded-lg border-l-4 border-emerald-500 bg-emerald-50 p-6">
            <div className="text-3xl mb-2">🟢</div>
            <div className="text-4xl font-bold text-emerald-700 mb-1">
              {formatNumber(activeCustomers.length)}
            </div>
            <div className="text-lg text-emerald-700 mb-4">{activePercentage.toFixed(0)}% Activos</div>
            <div className="text-sm text-emerald-600 mb-1">Revenue histórico</div>
            <div className="text-2xl font-bold text-emerald-700">{formatCurrency(activeRevenue)}</div>
          </div>

          {/* Dormant Card */}
          <div className="relative rounded-lg border-l-4 border-amber-500 bg-amber-50 p-6">
            <div className="text-3xl mb-2">💤</div>
            <div className="text-4xl font-bold text-amber-700 mb-1">
              {formatNumber(dormantCustomers.length)}
            </div>
            <div className="text-lg text-amber-700 mb-4">{dormantPercentage.toFixed(0)}% Dormidos</div>
            <div className="text-sm text-amber-600 mb-1">Revenue histórico</div>
            <div className="text-2xl font-bold text-amber-700">{formatCurrency(dormantRevenue)}</div>
          </div>
        </div>
      </div>

      {/* Insight Box */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex gap-3">
          <span className="text-xl">💡</span>
          <div className="flex-1 text-sm text-blue-800 space-y-2">
            <p>
              Tu tasa de dormancia ({dormantPercentage.toFixed(0)}%) está por encima del promedio de la industria.
              Si recuperas el 20% de dormidos ({Math.round(dormantCustomers.length * 0.2)} clientes):
            </p>
            <p className="font-semibold text-blue-700">
              → +${formatNumber(dormantRevenue * 0.2 / 12)}/mes en revenue adicional
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 2: Active Breakdown */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-foreground">Clientes Activos ({formatNumber(activeCustomers.length)} • {activePercentage.toFixed(0)}%)</h3>

        <Card className="bg-card border/50">
          <CardContent className="space-y-6 pt-6">
            {/* Champions */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>🏆</span>
                  <span className="font-semibold">Champions</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleExportSegment('Champions', champions)}
                  disabled={exportingSegment === 'Champions'}
                  className="h-8 gap-1"
                >
                  <Download className="h-3.5 w-3.5" />
                  CSV
                </Button>
              </div>
              <div className="h-2 bg-emerald-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all duration-800"
                  style={{ width: `${(champions.length / activeCustomers.length) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{((champions.length / activeCustomers.length) * 100).toFixed(0)}% • {formatNumber(champions.length)} clientes</span>
                <span className="text-emerald-600 font-semibold">{formatCurrency(getRevenue(champions))} • LTV ${formatNumber(champions.length > 0 ? getRevenue(champions) / champions.length : 0)}</span>
              </div>
            </div>

            {/* At Risk */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>⚠️</span>
                  <span className="font-semibold">En Riesgo</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleExportSegment('AtRisk', atRisk)}
                  disabled={exportingSegment === 'AtRisk'}
                  className="h-8 gap-1"
                >
                  <Download className="h-3.5 w-3.5" />
                  CSV
                </Button>
              </div>
              <div className="h-2 bg-amber-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-800"
                  style={{ width: `${(atRisk.length / activeCustomers.length) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{((atRisk.length / activeCustomers.length) * 100).toFixed(0)}% • {formatNumber(atRisk.length)} clientes</span>
                <span className="text-amber-600 font-semibold">{formatCurrency(getRevenue(atRisk))} • 60-90 días sin comprar</span>
              </div>
            </div>

            {/* Regular */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>👤</span>
                  <span className="font-semibold">Regulares</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleExportSegment('Regular', regular)}
                  disabled={exportingSegment === 'Regular'}
                  className="h-8 gap-1"
                >
                  <Download className="h-3.5 w-3.5" />
                  CSV
                </Button>
              </div>
              <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-800"
                  style={{ width: `${(regular.length / activeCustomers.length) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{((regular.length / activeCustomers.length) * 100).toFixed(0)}% • {formatNumber(regular.length)} clientes</span>
                <span className="text-blue-600 font-semibold">{formatCurrency(getRevenue(regular))} • En ciclo normal</span>
              </div>
            </div>

            {/* Alert for At Risk */}
            {atRisk.length > 0 && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 mt-4">
                <div className="space-y-2">
                  <div className="flex gap-2 text-sm text-amber-800">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <p>
                      <strong>{formatNumber(atRisk.length)} clientes en riesgo</strong> están a punto de volverse dormidos.
                      Actúa en los próximos 15-45 días para retenerlos.
                    </p>
                  </div>
                  <div className="text-xs text-amber-700 ml-7 space-y-1">
                    <p>Para crecer necesitas:</p>
                    <p>• Reducir churn de {formatNumber(monthlyChurnCount)} a ~{formatNumber(Math.round(monthlyChurnCount * 0.7))}/mes (-30%), O</p>
                    <p>• Aumentar reactivaciones de {formatNumber(monthlyReactivations)} a ~{formatNumber(Math.round(monthlyReactivations * 2))}/mes</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* SECTION 3: Dormant Breakdown */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-foreground">Clientes Dormidos ({formatNumber(dormantCustomers.length)} • {dormantPercentage.toFixed(0)}%)</h3>

        <Card className="bg-card border/50">
          <CardContent className="space-y-6 pt-6">
            {/* Recoverable */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>🔄</span>
                  <span className="font-semibold">Recuperables</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleExportSegment('Recoverable', recoverable)}
                  disabled={exportingSegment === 'Recoverable'}
                  className="h-8 gap-1"
                >
                  <Download className="h-3.5 w-3.5" />
                  CSV
                </Button>
              </div>
              <div className="h-2 bg-orange-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 rounded-full transition-all duration-800"
                  style={{ width: `${dormantCustomers.length > 0 ? (recoverable.length / dormantCustomers.length) * 100 : 0}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{dormantCustomers.length > 0 ? ((recoverable.length / dormantCustomers.length) * 100).toFixed(0) : 0}% • {formatNumber(recoverable.length)} clientes</span>
                <span className="text-orange-600 font-semibold">{formatCurrency(dormantRevenue * (dormantCustomers.length > 0 ? recoverable.length / dormantCustomers.length : 0))} histórico • ROI 15-25%</span>
              </div>
            </div>

            {/* Lost */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>❌</span>
                  <span className="font-semibold">Lost</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleExportSegment('Lost', lost)}
                  disabled={exportingSegment === 'Lost'}
                  className="h-8 gap-1"
                >
                  <Download className="h-3.5 w-3.5" />
                  CSV
                </Button>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gray-400 rounded-full transition-all duration-800"
                  style={{ width: `${dormantCustomers.length > 0 ? (lost.length / dormantCustomers.length) * 100 : 0}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{dormantCustomers.length > 0 ? ((lost.length / dormantCustomers.length) * 100).toFixed(0) : 0}% • {formatNumber(lost.length)} clientes</span>
                <span className="text-gray-600 font-semibold">{formatCurrency(dormantRevenue * (dormantCustomers.length > 0 ? lost.length / dormantCustomers.length : 0))} histórico • Bajo ROI</span>
              </div>
            </div>

            {/* Alert for churn flow */}
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 mt-4">
              <div className="flex gap-2 text-xs text-red-800">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <p>
                  Aproximadamente <strong>{Math.round((atRisk.length * churnRate) / 12)}</strong> clientes pasan a "Dormidos" cada mes.
                  Si no reduces este flujo, en 6 meses tendrás {dormantPercentage.toFixed(0) + 5}% de dormancia.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SECTION 4: Churn Rate */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-foreground">Tasa de Churn</h3>

        <Card className="bg-card border/50">
          <CardContent className="space-y-6 pt-6">
            <div className="text-center">
              <div className={`text-5xl font-bold mb-2 ${churnRate > benchmarkChurn ? 'text-amber-400' : 'text-emerald-400'}`}>
                {(churnRate * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                {churnRate > benchmarkChurn ? (
                  <>
                    <TrendingUp className="h-4 w-4 text-amber-500" />
                    Por encima del benchmark
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-4 w-4 text-emerald-500" />
                    Por debajo del benchmark
                  </>
                )}
              </div>
            </div>

            {/* Impact metrics */}
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-background">
                <div className="text-xs text-muted-foreground mb-1">Impacto actual</div>
                <div className="font-semibold">Pierdes {formatNumber(monthlyChurnCount)} clientes/mes = {formatCurrency(monthlyChurnCount * (activeRevenue / activeCustomers.length))} en LTV perdido</div>
              </div>

              <div className="p-3 rounded-lg bg-background">
                <div className="text-xs text-muted-foreground mb-1">Si baja al promedio (1.2%)</div>
                <div className="font-semibold text-emerald-600">Retienes {formatNumber(monthlyChurnCount - Math.round(activeCustomers.length * benchmarkChurn))} clientes/mes adicionales</div>
              </div>

              <div className="p-3 rounded-lg bg-background">
                <div className="text-xs text-muted-foreground mb-1">Proyección 12 meses</div>
                <div className="text-sm space-y-1">
                  <div>Con churn actual: <span className="font-semibold text-red-600">-{formatNumber(monthlyChurnCount * 12)}</span> clientes</div>
                  <div>Con churn objetivo: <span className="font-semibold text-emerald-600">-{formatNumber(Math.round(activeCustomers.length * benchmarkChurn) * 12)}</span> clientes</div>
                  <div>Diferencia: <span className="font-semibold text-emerald-600">{formatNumber((monthlyChurnCount - Math.round(activeCustomers.length * benchmarkChurn)) * 12)}</span> clientes salvados</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SECTION 5: Customer Flow */}
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-4">Flujo de Clientes (Último Mes)</h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left column: Customer journey flow */}
          <div className="space-y-3">
            {/* New Customers */}
            <Card className="bg-emerald-500/5 border-borderemerald-500/30">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Nuevos</div>
                    <div className="text-2xl font-bold text-emerald-700">+120</div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="text-sm text-muted-foreground">Primera compra</div>
                    <div className="text-lg font-semibold text-emerald-600">{formatCurrency(120 * (activeRevenue / activeCustomers.length * 0.4))}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Arrow down */}
            <div className="flex justify-center">
              <div className="text-2xl text-muted-foreground">↓</div>
            </div>

            {/* Active */}
            <Card className="bg-blue-50 border-2 border-blue-300">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Activos</div>
                    <div className="text-3xl font-bold text-blue-700">{formatNumber(activeCustomers.length)}</div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="text-sm text-muted-foreground">En ciclo</div>
                    <div className="text-2xl font-semibold text-blue-600">{formatCurrency(activeRevenue)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Flow indicators */}
            <div className="grid grid-cols-2 gap-2">
              <div className="flex justify-end text-red-600 text-sm font-semibold">
                -{formatNumber(monthlyChurnCount)} ↓<br/>
                <span className="text-xs text-red-500">(churn)</span>
              </div>
              <div className="flex justify-start text-emerald-600 text-sm font-semibold">
                ↑ +{formatNumber(monthlyReactivations)}<br/>
                <span className="text-xs text-emerald-500">(reactivados)</span>
              </div>
            </div>

            {/* Arrow down */}
            <div className="flex justify-center">
              <div className="text-2xl text-muted-foreground">↓</div>
            </div>

            {/* Dormant */}
            <Card className="bg-gray-100 border border-gray-300">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Dormidos</div>
                    <div className="text-2xl font-bold text-gray-600">{formatNumber(dormantCustomers.length)}</div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="text-sm text-muted-foreground">Fuera ciclo</div>
                    <div className="text-lg font-semibold text-gray-500 line-through">$0</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Alert for net change */}
            {netChange < 0 && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <div className="space-y-2">
                  <div className="flex gap-2 text-sm text-amber-800">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <p>
                      <strong>Problema detectado:</strong> El churn ({formatNumber(monthlyChurnCount)}/mes) es mayor que
                      las reactivaciones ({formatNumber(monthlyReactivations)}/mes).
                      <br />
                      <strong>Net: {netChange}/mes en clientes activos.</strong>
                    </p>
                  </div>
                  <div className="text-xs text-amber-700 ml-7 space-y-1">
                    <p>Para crecer necesitas:</p>
                    <p>• Reducir churn de {formatNumber(monthlyChurnCount)} a ~{formatNumber(Math.round(monthlyChurnCount * 0.7))}/mes (-30%), O</p>
                    <p>• Aumentar reactivaciones de {formatNumber(monthlyReactivations)} a ~{formatNumber(Math.round(monthlyReactivations * 2))}/mes</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
