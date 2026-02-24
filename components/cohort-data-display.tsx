'use client'

import { CohortAnalysis } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Users, ShoppingCart, Calendar, TrendingUp, CheckCircle2, Clock } from 'lucide-react'

interface CohortDataDisplayProps {
  analysis: CohortAnalysis
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function formatCohortLabel(cohort: string): string {
  const [year, month] = cohort.split('-')
  const date = new Date(parseInt(year), parseInt(month) - 1)
  return date.toLocaleDateString('es-AR', { year: 'numeric', month: 'long' })
}

function formatRate(rate: number): string {
  return `${rate.toFixed(1)}%`
}

function getRateColor(rate: number): string {
  if (rate >= 15) return 'bg-emerald-500/20 text-emerald-700'
  if (rate >= 10) return 'bg-green-500/20 text-green-700'
  if (rate >= 5) return 'bg-yellow-500/20 text-yellow-700'
  if (rate > 0) return 'bg-orange-500/20 text-orange-700'
  return 'bg-muted text-muted-foreground'
}

export function CohortDataDisplay({ analysis }: CohortDataDisplayProps) {
  // Calculate some key metrics
  const repeatCustomers = analysis.customers.filter(c => c.totalOrders > 1).length
  const repeatRate = ((repeatCustomers / analysis.totalCustomers) * 100).toFixed(1)
  const avgOrdersPerCustomer = (analysis.totalOrders / analysis.totalCustomers).toFixed(2)
  
  // Get fully observed cohorts for average calculation
  const fullyObservedCohorts = analysis.repurchaseAnalysis.filter(c => c.fully_observed)
  const avgRepurchaseRate6m = fullyObservedCohorts.length > 0
    ? (fullyObservedCohorts.reduce((sum, c) => sum + c.total_repurchase_rate_6m, 0) / fullyObservedCohorts.length).toFixed(1)
    : 'N/A'

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analysis.totalCustomers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              From {analysis.cohorts.length} cohorts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analysis.totalOrders.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {avgOrdersPerCustomer} orders/customer
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Repeat Rate (All Time)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{repeatRate}%</div>
            <p className="text-xs text-muted-foreground">
              {repeatCustomers.toLocaleString()} repeat customers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg 6-Month Rate</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgRepurchaseRate6m}{avgRepurchaseRate6m !== 'N/A' && '%'}</div>
            <p className="text-xs text-muted-foreground">
              {fullyObservedCohorts.length} fully observed cohorts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 6-Month Repurchase Analysis Table */}
      <Card>
        <CardHeader>
          <CardTitle>6-Month Repurchase Analysis</CardTitle>
          <CardDescription>
            Monthly repurchase rates for each cohort within a 6-month observation window. 
            Data through {formatDate(analysis.dataEndDate)}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 bg-background">Cohort</TableHead>
                  <TableHead className="text-right">Size</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">6M Total</TableHead>
                  <TableHead className="text-right">M1</TableHead>
                  <TableHead className="text-right">M2</TableHead>
                  <TableHead className="text-right">M3</TableHead>
                  <TableHead className="text-right">M4</TableHead>
                  <TableHead className="text-right">M5</TableHead>
                  <TableHead className="text-right">M6</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analysis.repurchaseAnalysis.map((cohort) => (
                  <TableRow key={cohort.cohort}>
                    <TableCell className="sticky left-0 bg-background font-medium">
                      {formatCohortLabel(cohort.cohort)}
                    </TableCell>
                    <TableCell className="text-right">
                      {cohort.cohort_size.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center">
                      {cohort.fully_observed ? (
                        <Badge variant="outline" className="gap-1 border-emerald-500 text-emerald-600">
                          <CheckCircle2 className="h-3 w-3" />
                          Full
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1 border-amber-500 text-amber-600">
                          <Clock className="h-3 w-3" />
                          {cohort.months_observed}mo
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`inline-flex rounded-md px-2 py-0.5 text-sm font-semibold ${getRateColor(cohort.total_repurchase_rate_6m)}`}>
                        {formatRate(cohort.total_repurchase_rate_6m)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {cohort.months_observed >= 1 ? (
                        <span className={`inline-flex rounded-md px-2 py-0.5 text-xs ${getRateColor(cohort.m1_repurchase)}`}>
                          {formatRate(cohort.m1_repurchase)}
                        </span>
                      ) : <span className="text-muted-foreground">-</span>}
                    </TableCell>
                    <TableCell className="text-right">
                      {cohort.months_observed >= 2 ? (
                        <span className={`inline-flex rounded-md px-2 py-0.5 text-xs ${getRateColor(cohort.m2_repurchase)}`}>
                          {formatRate(cohort.m2_repurchase)}
                        </span>
                      ) : <span className="text-muted-foreground">-</span>}
                    </TableCell>
                    <TableCell className="text-right">
                      {cohort.months_observed >= 3 ? (
                        <span className={`inline-flex rounded-md px-2 py-0.5 text-xs ${getRateColor(cohort.m3_repurchase)}`}>
                          {formatRate(cohort.m3_repurchase)}
                        </span>
                      ) : <span className="text-muted-foreground">-</span>}
                    </TableCell>
                    <TableCell className="text-right">
                      {cohort.months_observed >= 4 ? (
                        <span className={`inline-flex rounded-md px-2 py-0.5 text-xs ${getRateColor(cohort.m4_repurchase)}`}>
                          {formatRate(cohort.m4_repurchase)}
                        </span>
                      ) : <span className="text-muted-foreground">-</span>}
                    </TableCell>
                    <TableCell className="text-right">
                      {cohort.months_observed >= 5 ? (
                        <span className={`inline-flex rounded-md px-2 py-0.5 text-xs ${getRateColor(cohort.m5_repurchase)}`}>
                          {formatRate(cohort.m5_repurchase)}
                        </span>
                      ) : <span className="text-muted-foreground">-</span>}
                    </TableCell>
                    <TableCell className="text-right">
                      {cohort.months_observed >= 6 ? (
                        <span className={`inline-flex rounded-md px-2 py-0.5 text-xs ${getRateColor(cohort.m6_repurchase)}`}>
                          {formatRate(cohort.m6_repurchase)}
                        </span>
                      ) : <span className="text-muted-foreground">-</span>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded bg-emerald-500/20" />
              <span>15%+ repurchase</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded bg-green-500/20" />
              <span>10-15%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded bg-yellow-500/20" />
              <span>5-10%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded bg-orange-500/20" />
              <span>0-5%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cohort Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle>Cohort Summary</CardTitle>
          <CardDescription>
            Customers grouped by their first purchase month
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cohort</TableHead>
                <TableHead className="text-right">Customers</TableHead>
                <TableHead className="text-right">With Repurchase</TableHead>
                <TableHead className="text-right">Repurchase Rate</TableHead>
                <TableHead className="text-right">Total Orders</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analysis.cohorts.map((cohort) => {
                const customersWithRepurchase = cohort.customers.filter(c => c.totalOrders > 1).length
                const repurchaseRate = cohort.totalCustomers > 0 
                  ? ((customersWithRepurchase / cohort.totalCustomers) * 100).toFixed(1)
                  : '0'
                const totalOrders = cohort.customers.reduce((sum, c) => sum + c.totalOrders, 0)
                
                return (
                  <TableRow key={cohort.cohort}>
                    <TableCell className="font-medium">
                      {formatCohortLabel(cohort.cohort)}
                    </TableCell>
                    <TableCell className="text-right">
                      {cohort.totalCustomers.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {customersWithRepurchase.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={parseFloat(repurchaseRate) > 20 ? 'default' : 'secondary'}>
                        {repurchaseRate}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {totalOrders.toLocaleString()}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Customer Details Table */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Details</CardTitle>
          <CardDescription>
            Individual customer purchase history (showing first 100 customers)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-h-96 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Cohort</TableHead>
                  <TableHead className="text-right">Orders</TableHead>
                  <TableHead>First Purchase</TableHead>
                  <TableHead>Last Purchase</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analysis.customers.slice(0, 100).map((customer) => {
                  const lastPurchase = customer.purchases[customer.purchases.length - 1]
                  return (
                    <TableRow key={customer.email}>
                      <TableCell className="max-w-48 truncate font-mono text-sm">
                        {customer.email}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{customer.cohort}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {customer.totalOrders}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(customer.firstPurchaseDate)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(lastPurchase.paymentDate)}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
          {analysis.customers.length > 100 && (
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Showing 100 of {analysis.customers.length.toLocaleString()} customers
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
