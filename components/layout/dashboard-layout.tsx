'use client'

import React from "react"

import { useState, useEffect, useCallback } from 'react'
import { Sidebar } from './sidebar'
import { FileUploader } from '@/components/file-uploader'
import { DataProvider } from './data-provider'
import { processExcelData, parseCSV } from '@/lib/cohort-utils'
import type { CohortAnalysis } from '@/lib/types'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertCircle, RotateCcw, Loader2, BarChart3, XCircle } from 'lucide-react'

export function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [analysis, setAnalysis] = useState<CohortAnalysis | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleFileLoaded = useCallback((data: Record<string, unknown>[]) => {
    setIsProcessing(true)
    setErrors([])

    setTimeout(() => {
      try {
        const result = processExcelData(data, { observationWindow: 12 })

        if (result.analysis) {
          setAnalysis(result.analysis)
        }

        if (result.errors.length > 0) {
          setErrors(result.errors)
        }
      } catch (err) {
        setErrors([err instanceof Error ? err.message : 'Error al procesar el archivo'])
      }

      setIsProcessing(false)
    }, 0)
  }, [])

  const handleReset = useCallback(() => {
    setAnalysis(null)
    setErrors([])
  }, [])

  const handleAnalysisUpdate = useCallback((newAnalysis: CohortAnalysis) => {
    setAnalysis(newAnalysis)
    setErrors([])
  }, [])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
          <p className="text-muted-foreground">Cargando datos de ordenes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <DataProvider analysis={analysis} onReset={handleReset} onAnalysisUpdate={handleAnalysisUpdate}>
          <div className="min-h-screen">
            {!analysis ? (
              <div className="flex flex-col items-center justify-center min-h-screen gap-8 px-4 py-8">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-accent/10 p-2">
                    <BarChart3 className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                      Analisis de Recompra por Cohorte
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      Analisis completo del historial de compras
                    </p>
                  </div>
                </div>
                
                <div className="mx-auto w-full max-w-xl space-y-4">
                  <FileUploader
                    onFileLoaded={handleFileLoaded}
                    isLoading={isProcessing}
                  />

                  {isProcessing && (
                    <p className="mt-4 text-center text-sm text-muted-foreground">
                      Procesando datos...
                    </p>
                  )}

                  {!isProcessing && errors.length > 0 && (
                    <Alert variant="destructive">
                      <XCircle className="h-4 w-4" />
                      <AlertTitle>No se pudo procesar el archivo</AlertTitle>
                      <AlertDescription>
                        <ul className="mt-1 list-inside list-disc space-y-1">
                          {errors.map((error, i) => (
                            <li key={i} className="text-sm">{error}</li>
                          ))}
                        </ul>
                        <p className="mt-2 text-xs text-muted-foreground">
                          Asegurate de que el CSV tenga columnas de email, fecha y monto.
                        </p>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            ) : (
              <>
                {children}
                {errors.length > 0 && (
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
              </>
            )}
          </div>
        </DataProvider>
      </main>
    </div>
  )
}
