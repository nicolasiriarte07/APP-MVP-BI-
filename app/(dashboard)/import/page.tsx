'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CSVUpload } from '@/components/import/csv-upload'
import { IndustrySelector } from '@/components/import/industry-selector'
import { useData } from '@/components/layout/data-provider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle2, AlertCircle, UploadCloud } from 'lucide-react'
import { processExcelData, parseCSV } from '@/lib/cohort-utils'

const parseCSVFile = parseCSV; // Declare the variable before using it

export default function ImportPage() {
  const router = useRouter()
  const { onAnalysisUpdate } = useData()
  const [csvFile, setCSVFile] = useState<File | null>(null)
  const [industry, setIndustry] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleFileSelected = (file: File) => {
    setCSVFile(file)
    setError(null)
    setSuccess(false)
  }

  const handleIndustrySelected = (selectedIndustry: string) => {
    setIndustry(selectedIndustry)
  }

  const handleAnalyze = async () => {
    if (!csvFile || !industry) {
      setError('Por favor selecciona archivo e industria')
      return
    }

    setIsAnalyzing(true)
    setError(null)
    setSuccess(false)

    try {
      // Read file as text
      const csvText = await csvFile.text()

      if (!csvText || csvText.trim().length === 0) {
        throw new Error('El archivo CSV está vacío')
      }

      // Parse CSV text to objects
      const data = parseCSV(csvText)

      if (data.length === 0) {
        throw new Error('No se encontraron datos válidos en el archivo')
      }

      // Process data using same logic as DashboardLayout
      const result = processExcelData(data, { observationWindow: 12 })

      if (!result.analysis) {
        throw new Error('No se pudo procesar el análisis de los datos')
      }

      // Add selected industry to analysis
      result.analysis.selectedIndustry = industry

      // Update global analysis
      onAnalysisUpdate(result.analysis)
      setSuccess(true)

      // Redirect after brief delay to show success state
      setTimeout(() => {
        router.push('/home')
      }, 1500)
    } catch (err) {
      console.log('[v0] Analysis error:', err)
      setError(err instanceof Error ? err.message : 'Error procesando archivo')
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/50 px-6 py-8 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-lg bg-accent/10 p-2">
              <UploadCloud className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Importar Datos de Ordenes
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Sube tu CSV de ordenes y comienza el análisis de recompra
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 px-6 py-12 sm:px-8">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Upload Section */}
          <Card className="border-border/50 bg-card">
            <CardHeader>
              <CardTitle className="text-lg">1. Selecciona tu archivo CSV</CardTitle>
              <CardDescription>
                Arrastra y suelta o haz clic para seleccionar tu archivo de ordenes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CSVUpload 
                onFileSelect={handleFileSelected}
                fileName={csvFile?.name}
              />
            </CardContent>
          </Card>

          {/* Industry Selector */}
          {csvFile && (
            <Card className="border-border/50 bg-card">
              <CardHeader>
                <CardTitle className="text-lg">2. Selecciona tu industria</CardTitle>
                <CardDescription>
                  Esto ayuda a contextualizar el análisis de recompra
                </CardDescription>
              </CardHeader>
              <CardContent>
                <IndustrySelector 
                  onSelect={handleIndustrySelected}
                  selected={industry}
                  isVisible={true}
                />
              </CardContent>
            </Card>
          )}

          {/* Analysis Ready State */}
          {csvFile && industry && (
            <div className="space-y-4">
              <div className="rounded-lg border border-accent/30 bg-accent/5 p-4">
                <p className="text-sm text-foreground">
                  ✓ Datos listos: <span className="font-semibold">{csvFile.name}</span> ({industry})
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Success State */}
              {success && (
                <Alert className="border-emerald-500/30 bg-emerald-500/5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <AlertDescription className="text-emerald-600">
                    ¡Análisis completado! Redirigiendo...
                  </AlertDescription>
                </Alert>
              )}

              {/* Analyze Button */}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="gap-2"
                  size="lg"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Analizando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Analizar Datos
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
