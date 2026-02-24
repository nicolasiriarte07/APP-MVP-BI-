'use client'

import { Card } from '@/components/ui/card'

export interface SaludDeBaseProps {
  totalClientes: number

  activosTotal: number
  activosPorcentaje: number
  activosRevenue: number

  championsTotal: number
  championsPorcentaje: number
  championsRevenue: number

  enRiesgoTotal: number
  enRiesgoPorcentaje: number
  enRiesgoRevenue: number

  regularesTotal: number
  regularesPorcentaje: number
  regularesRevenue: number

  dormidosTotal: number
  dormidosPorcentaje: number
  dormidosRevenuePerdido: number

  recuperablesTotal: number
  recuperablesPorcentaje: number

  lostTotal: number
  lostPorcentaje: number
}

export function SaludDeBase(props: SaludDeBaseProps) {
  const formatNumber = (n: number) => new Intl.NumberFormat('es-AR').format(n)
  const formatPercentage = (p: number) => (p * 100).toFixed(1) + '%'
  const formatCurrency = (n: number) => '$' + formatNumber(n)

  return (
    <div className="space-y-6">
      {/* SECCIÓN 1: Overview */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <span>🎯</span> Salud de Base
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Card Activos */}
          <div className="rounded-lg border-l-4 border-l-emerald-600 bg-emerald-500/5 p-6 border-borderemerald-500/20">
            <div className="mb-4 text-sm font-semibold text-muted-foreground">ACTIVOS</div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-foreground">{formatNumber(props.activosTotal)}</div>
              <div className="text-xl text-emerald-600 font-semibold">{formatPercentage(props.activosPorcentaje)}</div>
              <div className="text-sm text-muted-foreground pt-2">{formatCurrency(props.activosRevenue)}</div>
            </div>
          </div>

          {/* Card Dormidos */}
          <div className="rounded-lg border-l-4 border-l-orange-500 bg-orange-500/5 p-6 border-borderorange-500/20">
            <div className="mb-4 text-sm font-semibold text-muted-foreground">DORMIDOS</div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-foreground">{formatNumber(props.dormidosTotal)}</div>
              <div className="text-xl text-orange-500 font-semibold">{formatPercentage(props.dormidosPorcentaje)}</div>
              <div className="text-sm text-muted-foreground pt-2">{formatCurrency(props.dormidosRevenuePerdido)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: Desglose Activos */}
      <div className="space-y-4">
        <div className="rounded-lg border border/50 bg-card p-6">
          <h3 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Activos ({formatNumber(props.activosTotal)})
          </h3>

          <div className="space-y-5">
            {/* Champions */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">Champions</span>
                <span className="text-xs text-muted-foreground">
                  {formatPercentage(props.championsPorcentaje)} • {formatNumber(props.championsTotal)} •{' '}
                  {formatCurrency(props.championsRevenue)}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full bg-emerald-600"
                  style={{ width: (props.championsPorcentaje * 100).toFixed(1) + '%' }}
                />
              </div>
            </div>

            {/* En Riesgo */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">En Riesgo</span>
                <span className="text-xs text-muted-foreground">
                  {formatPercentage(props.enRiesgoPorcentaje)} • {formatNumber(props.enRiesgoTotal)} •{' '}
                  {formatCurrency(props.enRiesgoRevenue)}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full bg-amber-500"
                  style={{ width: (props.enRiesgoPorcentaje * 100).toFixed(1) + '%' }}
                />
              </div>
            </div>

            {/* Regulares */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">Regulares</span>
                <span className="text-xs text-muted-foreground">
                  {formatPercentage(props.regularesPorcentaje)} • {formatNumber(props.regularesTotal)} •{' '}
                  {formatCurrency(props.regularesRevenue)}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full bg-blue-500"
                  style={{ width: (props.regularesPorcentaje * 100).toFixed(1) + '%' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN 3: Desglose Dormidos */}
      <div className="space-y-4">
        <div className="rounded-lg border border/50 bg-card p-6">
          <h3 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Dormidos ({formatNumber(props.dormidosTotal)})
          </h3>

          <div className="space-y-5">
            {/* Recuperables */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">Recuperables</span>
                <span className="text-xs text-muted-foreground">
                  {formatPercentage(props.recuperablesPorcentaje)} • {formatNumber(props.recuperablesTotal)}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full bg-orange-400"
                  style={{ width: (props.recuperablesPorcentaje * 100).toFixed(1) + '%' }}
                />
              </div>
            </div>

            {/* Lost */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">Lost</span>
                <span className="text-xs text-muted-foreground">
                  {formatPercentage(props.lostPorcentaje)} • {formatNumber(props.lostTotal)}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full bg-slate-500"
                  style={{ width: (props.lostPorcentaje * 100).toFixed(1) + '%' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
