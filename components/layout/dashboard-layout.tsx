'use client'

import React from "react"

import { useState, useEffect, useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Sidebar } from './sidebar'
import { DataProvider } from './data-provider'
import type { CohortAnalysis } from '@/lib/types'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

export function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [analysis, setAnalysis] = useState<CohortAnalysis | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  const pathname = usePathname()
  const router = useRouter()

  const handleReset = useCallback(() => {
    setAnalysis(null)
    setErrors([])
  }, [])

  const handleAnalysisUpdate = useCallback((newAnalysis: CohortAnalysis) => {
    setAnalysis(newAnalysis)
    setErrors([])
  }, [])

  // When there is no analysis and user is not on the import page, redirect there.
  // The import page is the mandatory starting point: upload CSV → select industry → analyze.
  useEffect(() => {
    if (!analysis && pathname !== '/import') {
      router.push('/import')
    }
  }, [analysis, pathname, router])

  // Render nothing while redirecting
  if (!analysis && pathname !== '/import') {
    return null
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <DataProvider analysis={analysis} onReset={handleReset} onAnalysisUpdate={handleAnalysisUpdate}>
          <div className="min-h-screen">
            {children}
            {analysis && errors.length > 0 && (
              <div className="px-4 py-8">
                <Alert variant="destructive" className="mx-auto max-w-7xl">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Advertencias de Procesamiento</AlertTitle>
                  <AlertDescription>
                    <ul className="mt-2 list-inside list-disc space-y-1">
                      {errors.slice(0, 10).map((error, index) => (
                        <li key={index} className="text-sm">{error}</li>
                      ))}
                      {errors.length > 10 && (
                        <li className="text-sm">...y {errors.length - 10} advertencias mas</li>
                      )}
                    </ul>
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </div>
        </DataProvider>
      </main>
    </div>
  )
}
