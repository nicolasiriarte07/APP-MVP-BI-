'use client'

import React from "react"

import { useState } from 'react'
import { Upload, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CSVUploadProps {
  onFileSelect: (file: File) => void
  fileName?: string
}

export function CSVUpload({ onFileSelect, fileName }: CSVUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<string | null>(fileName || null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        handleFileSelect(file)
      }
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleFileSelect = async (file: File) => {
    setIsUploading(true)
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 800))
    setUploadedFile(file.name)
    setIsUploading(false)
    onFileSelect(file)
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Importar Datos</h3>
        <p className="text-sm text-muted-foreground">Carga tu archivo CSV de órdenes desde Tiendanube</p>
      </div>

      <label
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 cursor-pointer transition-all duration-200',
          isDragOver && !uploadedFile
            ? 'border-chart-1 bg-chart-1/5'
            : uploadedFile
            ? 'border-emerald-500/50 bg-emerald-500/5'
            : 'border-muted-foreground/30 hover:border-muted-foreground/50 hover:bg-muted/30',
          isUploading && 'opacity-75'
        )}
      >
        <input
          type="file"
          accept=".csv"
          onChange={handleFileInput}
          className="hidden"
          disabled={isUploading}
        />

        <div className="flex flex-col items-center gap-3 text-center">
          {isUploading ? (
            <>
              <div className="h-12 w-12 rounded-lg bg-muted/50 flex items-center justify-center animate-pulse">
                <Upload className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground">Cargando archivo...</p>
                <p className="text-sm text-muted-foreground mt-1">Por favor espera</p>
              </div>
            </>
          ) : uploadedFile ? (
            <>
              <div className="h-12 w-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <p className="font-medium text-foreground">✓ {uploadedFile}</p>
                <p className="text-xs text-muted-foreground mt-1">Cargado correctamente</p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  setUploadedFile(null)
                }}
                className="text-xs text-muted-foreground hover:text-foreground mt-2 underline"
              >
                Cambiar archivo
              </button>
            </>
          ) : (
            <>
              <div className="h-12 w-12 rounded-lg bg-muted/50 flex items-center justify-center">
                <Upload className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground">Arrastra tu archivo CSV aquí</p>
                <p className="text-sm text-muted-foreground mt-1">o haz clic para seleccionar</p>
              </div>
            </>
          )}
        </div>
      </label>
    </div>
  )
}
