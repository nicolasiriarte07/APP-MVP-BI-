'use client'

import { useData } from '@/components/layout/data-provider'
import { CohortHeatmap } from '@/components/dashboard/cohort-heatmap'
import { OrderMetricsComponent } from '@/components/dashboard/order-metrics'
import { FirstPurchaseProductsComponent } from '@/components/dashboard/first-purchase-products'

export default function GrowthPage() {
  const { analysis } = useData()

  if (!analysis) {
    return null
  }

  return (
    <div className="space-y-6 w-full px-2 sm:px-4 md:px-6 lg:px-8 py-8 max-w-none">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Crecimiento</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Salud de cohortes, velocidad de compra, abandono y dinámicas de retención
        </p>
      </div>

      {/* Purchase Dynamics & Drop-off */}
      <OrderMetricsComponent orderMetrics={analysis.orderMetrics} />

      {/* Top Products Acquiring Customers */}
      <FirstPurchaseProductsComponent products={analysis.firstPurchaseProducts} />

      {/* Cohort Analysis */}
      <CohortHeatmap analysis={analysis} />
    </div>
  )
}
