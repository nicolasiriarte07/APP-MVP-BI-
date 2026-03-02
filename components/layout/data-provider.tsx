'use client'

import React, { createContext, useContext, useMemo } from 'react'
import type { CohortAnalysis, GrowthOpportunity } from '@/lib/types'
import { detectGrowthOpportunities } from '@/lib/opportunities'

interface DataContextType {
  analysis: CohortAnalysis | null
  opportunities: GrowthOpportunity[]
  onReset: () => void
  onAnalysisUpdate: (analysis: CohortAnalysis) => void
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({
  analysis,
  onReset,
  onAnalysisUpdate,
  children,
}: {
  analysis: CohortAnalysis | null
  onReset: () => void
  onAnalysisUpdate: (analysis: CohortAnalysis) => void
  children: React.ReactNode
}) {
  const opportunities = useMemo(() => {
    return analysis ? detectGrowthOpportunities(analysis) : []
  }, [analysis])

  return (
    <DataContext.Provider value={{ analysis, opportunities, onReset, onAnalysisUpdate }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error('useData must be used within DataProvider')
  }
  return context
}
