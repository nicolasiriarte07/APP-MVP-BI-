'use client'

import { RecencyMetrics } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Clock, ArrowRight } from 'lucide-react'

interface RecencyCardsProps {
  recencyMetrics: RecencyMetrics
}

export function RecencyCards({ recencyMetrics }: RecencyCardsProps) {
  const {
    avgDays1to2,
    avgDays2to3,
    avgDays3to4,
    avgDays4to5,
    customers1to2,
    customers2to3,
    customers3to4,
    customers4to5,
  } = recencyMetrics

  const formatDays = (days: number | null): string => {
    if (days === null) return 'N/A'
    return `${days}`
  }

  const cards = [
    {
      title: 'Recencia 1ra a 2da compra',
      days: avgDays1to2,
      customers: customers1to2,
      purchaseFrom: '1ra',
      purchaseTo: '2da',
      color: 'text-chart-2',
      bgColor: 'bg-chart-2/10',
    },
    {
      title: 'Recencia 2da a 3ra compra',
      days: avgDays2to3,
      customers: customers2to3,
      purchaseFrom: '2da',
      purchaseTo: '3ra',
      color: 'text-chart-3',
      bgColor: 'bg-chart-3/10',
    },
    {
      title: 'Recencia 3ra a 4ta compra',
      days: avgDays3to4,
      customers: customers3to4,
      purchaseFrom: '3ra',
      purchaseTo: '4ta',
      color: 'text-chart-4',
      bgColor: 'bg-chart-4/10',
    },
    {
      title: 'Recencia 4ta a 5ta compra',
      days: avgDays4to5,
      customers: customers4to5,
      purchaseFrom: '4ta',
      purchaseTo: '5ta',
      color: 'text-chart-5',
      bgColor: 'bg-chart-5/10',
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title} className="border/50 bg-card">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                  <span>{card.purchaseFrom}</span>
                  <ArrowRight className="h-3 w-3" />
                  <span>{card.purchaseTo} compra</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <p className="text-3xl font-bold tracking-tight">
                    {formatDays(card.days)}
                  </p>
                  {card.days !== null && (
                    <span className="text-lg text-muted-foreground">dias</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Basado en {customers1to2 > 0 ? card.customers.toLocaleString() : 0} clientes
                </p>
              </div>
              <div className={`rounded-lg ${card.bgColor} p-2.5`}>
                <Clock className={`h-5 w-5 ${card.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
