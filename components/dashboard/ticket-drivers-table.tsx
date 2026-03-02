import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { TicketDriver } from '@/lib/types'

interface Props {
  drivers: TicketDriver[]
}

export function TicketDriversTable({ drivers }: Props) {
  if (drivers.length === 0) {
    return (
      <Card className="border/50 bg-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Top Productos Impulsando Carritos de Alto Valor</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No hay datos de productos disponibles</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border/50 bg-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Top Productos Impulsando Carritos de Alto Valor</CardTitle>
        <p className="mt-2 text-sm text-muted-foreground">Productos que aparecen desproporcionadamente en pedidos de alto valor (top 25%)</p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border/30">
                <th className="text-left py-3 px-4 font-semibold text-foreground">Rango</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Producto</th>
                <th className="text-right py-3 px-4 font-semibold text-foreground">Lift Score</th>
                <th className="text-right py-3 px-4 font-semibold text-foreground">% Alto Valor</th>
                <th className="text-right py-3 px-4 font-semibold text-foreground">Ticket Promedio</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((driver) => (
                <tr key={driver.product_name} className="border-b border-border/20 hover:bg-background/40">
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-accent/10 text-accent font-semibold text-xs">
                      {driver.rank}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-foreground font-medium">{driver.product_name}</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-accent font-semibold">{driver.lift_score.toFixed(2)}x</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-chart-2">{driver.presence_in_high_value_orders.toFixed(1)}%</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-foreground">${driver.avg_cart_value_when_present.toFixed(2)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
