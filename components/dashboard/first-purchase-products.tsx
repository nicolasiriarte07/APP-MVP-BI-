'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShoppingCart } from 'lucide-react'
import type { FirstPurchaseProduct } from '@/lib/types'

interface FirstPurchaseProductsProps {
  products: FirstPurchaseProduct[]
}

export function FirstPurchaseProductsComponent({ products }: FirstPurchaseProductsProps) {
  if (!products || products.length === 0) {
    return (
      <Card className="border/50 bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-medium text-foreground">
            <ShoppingCart className="h-4 w-4 text-chart-2" />
            Top Products Acquiring New Customers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No products found in first purchases</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border/50 bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-medium text-foreground">
          <ShoppingCart className="h-4 w-4 text-chart-2" />
          Top Products Acquiring New Customers
        </CardTitle>
        <p className="mt-2 text-xs text-muted-foreground">
          Top 10 products that appear most frequently in customers' first orders
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border">
                <th className="py-3 px-4 text-left font-medium text-muted-foreground">Rank</th>
                <th className="py-3 px-4 text-left font-medium text-muted-foreground">Product</th>
                <th className="py-3 px-4 text-right font-medium text-muted-foreground">First Purchase Count</th>
                <th className="py-3 px-4 text-right font-medium text-muted-foreground">% of First Orders</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.rank} className="border-b border/50 hover:bg-muted/20 transition-colors">
                  <td className="py-3 px-4">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-chart-2/10 text-xs font-semibold text-chart-2">
                      {product.rank}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-foreground">
                    <div className="max-w-xs truncate">{product.product_name}</div>
                  </td>
                  <td className="py-3 px-4 text-right text-foreground font-medium">
                    {product.first_purchase_count}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-chart-2 rounded-full transition-all"
                          style={{ width: `${Math.min(product.percentage_of_first_orders, 100)}%` }}
                        />
                      </div>
                      <span className="w-12 text-right text-muted-foreground">
                        {product.percentage_of_first_orders.toFixed(1)}%
                      </span>
                    </div>
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
