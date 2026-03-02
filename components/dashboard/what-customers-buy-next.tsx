import type { TopNextPurchase } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight } from 'lucide-react'

interface WhatCustomersBuyNextProps {
  topNextPurchases: TopNextPurchase[]
}

export function WhatCustomersBuyNext({ topNextPurchases }: WhatCustomersBuyNextProps) {
  if (topNextPurchases.length === 0) {
    return null
  }

  return (
    <Card className="border/50 bg-card">
      <CardHeader>
        <CardTitle>What Customers Buy Next</CardTitle>
        <CardDescription>
          Sequential purchase patterns. After buying X, customers typically buy Y within these days.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border/30 text-muted-foreground">
                <th className="text-left py-3 px-4 font-semibold">After Buying</th>
                <th className="text-center py-3 px-4 font-semibold">
                  <ArrowRight className="h-4 w-4 inline" />
                </th>
                <th className="text-left py-3 px-4 font-semibold">Next Purchase</th>
                <th className="text-center py-3 px-4 font-semibold">Probability</th>
                <th className="text-center py-3 px-4 font-semibold">Times</th>
                <th className="text-center py-3 px-4 font-semibold">Days Between</th>
              </tr>
            </thead>
            <tbody>
              {topNextPurchases.map((item, idx) => (
                <tr key={idx} className="border-b border-border/20 hover:bg-accent/5">
                  <td className="py-3 px-4">
                    <span className="font-medium text-foreground">{item.origin_product}</span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <ArrowRight className="h-4 w-4 text-accent inline" />
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-medium text-foreground">{item.most_likely_next_product}</span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className="inline-block px-2 py-1 rounded-full bg-accent/10 text-accent font-semibold">
                      {(item.probability * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td className="text-center py-3 px-4 text-muted-foreground">
                    {item.transition_count}x
                  </td>
                  <td className="text-center py-3 px-4 font-medium">
                    {item.avg_days_between_orders} days
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
