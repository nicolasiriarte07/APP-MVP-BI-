import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ProductBundle } from '@/lib/types'

interface Props {
  duos: ProductBundle[]
  trios: ProductBundle[]
}

export function BundlesIntelligence({ duos, trios }: Props) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Product Duos */}
      <Card className="border/50 bg-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Top Duos de Productos</CardTitle>
          <p className="mt-2 text-sm text-muted-foreground">Pares más frecuentes en el mismo pedido</p>
        </CardHeader>
        <CardContent>
          {duos.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin datos disponibles</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border/30">
                    <th className="text-left py-3 px-3 font-semibold text-foreground">Producto A</th>
                    <th className="text-left py-3 px-3 font-semibold text-foreground">Producto B</th>
                    <th className="text-right py-3 px-3 font-semibold text-foreground">Veces</th>
                  </tr>
                </thead>
                <tbody>
                  {duos.map((duo, idx) => (
                    <tr key={idx} className="border-b border-border/20 hover:bg-background/40">
                      <td className="py-3 px-3 text-foreground text-xs">{duo.products[0]}</td>
                      <td className="py-3 px-3 text-foreground text-xs">{duo.products[1]}</td>
                      <td className="py-3 px-3 text-right">
                        <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-info/10 text-info font-semibold text-xs">
                          {duo.co_occurrence_count}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Product Trios */}
      <Card className="border/50 bg-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Top Tríos de Productos</CardTitle>
          <p className="mt-2 text-sm text-muted-foreground">Tríos más frecuentes en el mismo pedido</p>
        </CardHeader>
        <CardContent>
          {trios.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin datos disponibles</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border/30">
                    <th className="text-left py-3 px-3 font-semibold text-foreground">Productos</th>
                    <th className="text-right py-3 px-3 font-semibold text-foreground">Veces</th>
                  </tr>
                </thead>
                <tbody>
                  {trios.map((trio, idx) => (
                    <tr key={idx} className="border-b border-border/20 hover:bg-background/40">
                      <td className="py-3 px-3 text-foreground text-xs">
                        <div className="space-y-0.5">
                          {trio.products.map((product, i) => (
                            <div key={i}>{product}</div>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-warning/10 text-warning font-semibold text-xs">
                          {trio.co_occurrence_count}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
