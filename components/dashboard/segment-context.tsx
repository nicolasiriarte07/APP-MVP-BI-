'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { SegmentSummary } from '@/lib/types'
import { Users, AlertTriangle, Zap, Ghost, Download } from 'lucide-react'
import { useState } from 'react'
import { useData } from '@/components/layout/data-provider'

interface SegmentContextProps {
  segments: SegmentSummary[]
}

export function SegmentContext({ segments }: SegmentContextProps) {
  const { analysis } = useData()
  const [exportingSegment, setExportingSegment] = useState<string | null>(null)

  const handleExportSegment = async (segmentName: string) => {
    if (!analysis) return
    
    setExportingSegment(segmentName)
    try {
      const response = await fetch('/api/exports/rfm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customers: analysis.customers,
          segment: segmentName
        })
      })
      
      if (!response.ok) throw new Error('Export failed')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `rfm_${segmentName.toLowerCase().replace(/\s+/g, '_')}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Export error:', error)
    } finally {
      setExportingSegment(null)
    }
  }
  const getSegmentInfo = (segment: SegmentSummary) => {
    const { segment: name, customer_count, percentage_of_customers, revenue_share, avg_revenue_per_customer } = segment

    switch (name) {
      case 'Loyal':
        return {
          icon: Users,
          iconColor: 'text-accent',
          bgColor: 'bg-accent/10',
          title: 'Clientes Leales',
          description: `Estos ${customer_count} clientes (${percentage_of_customers.toFixed(1)}% de tu base) son tu núcleo. Compran regularmente, generan ${revenue_share.toFixed(1)}% de tus ingresos y gastan ~${avg_revenue_per_customer.toFixed(0)}/compra en promedio. Son tus embajadores naturales: protégelos.`,
          behavior: 'Compran frecuentemente + alto valor + bajo riesgo de churn',
          action: 'Estrategia: Retención extrema. Ofréceles acceso exclusivo, rewards personalizados y comunidad VIP.'
        }
      
      case 'Potential':
        return {
          icon: Zap,
          iconColor: 'text-chart-2',
          bgColor: 'bg-chart-2/10',
          title: 'Clientes en Potencial',
          description: `Estos ${customer_count} clientes (${percentage_of_customers.toFixed(1)}%) han comprado recientemente pero aún no han alcanzado la frecuencia de los Leales. Generan ${revenue_share.toFixed(1)}% de ingresos con un valor promedio de ${avg_revenue_per_customer.toFixed(0)}/compra. Son tu siguiente línea de defensores.`,
          behavior: 'Compras moderadas + buen engagement + en camino a convertirse en Leales',
          action: 'Estrategia: Convertir a Leales. Sé agresivo: ofrece incentivos de recompra a M2-M3, educación de producto, contenido exclusivo.'
        }
      
      case 'At Risk':
        return {
          icon: AlertTriangle,
          iconColor: 'text-warning',
          bgColor: 'bg-warning/10',
          title: 'Clientes en Riesgo',
          description: `${customer_count} clientes (${percentage_of_customers.toFixed(1)}%) **ALGUNA VEZ compraron** pero hace tiempo que no vuelven. Representan ${revenue_share.toFixed(1)}% en ingresos fantasma: dinero que perdiste. Cada día sin acción los acerca a "Lost".`,
          behavior: 'Compraban antes + inactividad reciente + alto riesgo de churn permanente',
          action: 'Estrategia: Win-back URGENTE. Campaña personalizada en 7 días: reconoce su historial, ofrece incentivo exclusivo, hazles sentir que se les echa de menos.'
        }
      
      case 'Lost':
        return {
          icon: Ghost,
          iconColor: 'text-muted-foreground',
          bgColor: 'bg-muted/10',
          title: 'Clientes Perdidos',
          description: `${customer_count} clientes (${percentage_of_customers.toFixed(1)}%) han estado inactivos por mucho tiempo. Aunque todavía generan ${revenue_share.toFixed(1)}% teórico, en realidad son zombies en tu base de datos. La probabilidad de recuperarlos es baja pero no nula.`,
          behavior: 'Sin compras por largo período + propensión muy baja a volver + bajo LTV',
          action: 'Estrategia: Resurrección de bajo costo. Prueba un email final: "¿Qué pasó?" + oferta de último recurso. Si no responden, archiva.'
        }
      
      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Contexto de Segmentos</h3>
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2">
        {segments.map((segment) => {
          const info = getSegmentInfo(segment)
          if (!info) return null

          const Icon = info.icon

          return (
            <Card key={segment.segment} className="relative bg-white border border-gray-200 shadow-md shadow-gray-900/10">
              <div className="absolute top-4 right-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleExportSegment(segment.segment)}
                  disabled={exportingSegment === segment.segment}
                  className="gap-1 border-gray-300 text-gray-600 hover:bg-gray-100"
                >
                  <Download className="h-3 w-3" />
                  {exportingSegment === segment.segment ? 'CSV' : 'CSV'}
                </Button>
              </div>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start gap-3">
                    <div className={`rounded-lg ${info.bgColor} p-2`}>
                      <Icon className={`h-5 w-5 ${info.iconColor}`} />
                    </div>
                    <h4 className="font-semibold text-gray-900">{info.title}</h4>
                  </div>

                  {/* Description */}
                  <p className="text-sm leading-relaxed text-gray-700">
                    {info.description}
                  </p>

                  {/* Behavior */}
                  <div className="rounded-lg bg-slate-800 p-3">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Comportamiento</p>
                    <p className="text-sm text-slate-100 leading-relaxed">{info.behavior}</p>
                  </div>

                  {/* Action */}
                  <div className="rounded-lg bg-blue-600 p-3">
                    <p className="text-xs font-bold text-blue-200 uppercase tracking-widest mb-1.5">Recomendación</p>
                    <p className="text-sm text-white font-medium leading-relaxed">{info.action}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
