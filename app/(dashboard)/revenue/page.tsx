'use client'

import { useData } from '@/components/layout/data-provider'
import { StrategicFinancials } from '@/components/dashboard/strategic-financials'
import { TicketDriversTable } from '@/components/dashboard/ticket-drivers-table'
import { BundlesIntelligence } from '@/components/dashboard/product-bundles-intelligence'

export default function RevenuePage() {
  const { analysis } = useData()

  if (!analysis) {
    return null
  }

  return (
    <div className="space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Ingresos</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Ticket promedio, crecimiento LTV y concentración de ingresos por número de compra
        </p>
      </div>

      {/* Strategic Financial Visualizations */}
      <StrategicFinancials analysis={analysis} />

      {/* Product Revenue Intelligence */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground">Inteligencia de Productos</h2>
        
        {/* Ticket Drivers - Products that lift cart value */}
        <div className="mb-6">
          <TicketDriversTable drivers={analysis.productIntelligence.ticket_drivers} />
        </div>

        {/* Product Bundles - Frequently co-purchased items */}
        <BundlesIntelligence 
          duos={analysis.productIntelligence.product_duos}
          trios={analysis.productIntelligence.product_trios}
        />
      </div>
    </div>
  )
}
