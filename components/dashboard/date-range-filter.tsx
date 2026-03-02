'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronDown } from 'lucide-react'

export type DateRangePreset = 'last30' | 'last90' | 'last6m' | 'last12m' | 'ytd' | 'custom'

interface DateFilterProps {
  onRangeChange: (startDate: Date, endDate: Date) => void
  defaultPreset?: DateRangePreset
}

export function DateRangeFilter({ onRangeChange, defaultPreset = 'last6m' }: DateFilterProps) {
  const [selectedPreset, setSelectedPreset] = useState<DateRangePreset>(defaultPreset)
  const [isOpen, setIsOpen] = useState(false)
  const today = new Date()

  const getDateRange = (preset: DateRangePreset): { start: Date; end: Date; label: string } => {
    const end = new Date(today)
    let start = new Date(today)

    switch (preset) {
      case 'last30':
        start.setDate(end.getDate() - 30)
        return { start, end, label: 'Last 30 days' }
      case 'last90':
        start.setDate(end.getDate() - 90)
        return { start, end, label: 'Last 90 days' }
      case 'last6m':
        start.setMonth(end.getMonth() - 6)
        return { start, end, label: 'Last 6 months' }
      case 'last12m':
        start.setFullYear(end.getFullYear() - 1)
        return { start, end, label: 'Last 12 months' }
      case 'ytd':
        start = new Date(end.getFullYear(), 0, 1)
        return { start, end, label: 'Year to date' }
      default:
        return { start, end, label: 'Custom' }
    }
  }

  const presets = [
    { id: 'last30' as const, label: 'Last 30 days' },
    { id: 'last90' as const, label: 'Last 90 days' },
    { id: 'last6m' as const, label: 'Last 6 months' },
    { id: 'last12m' as const, label: 'Last 12 months' },
    { id: 'ytd' as const, label: 'Year to date' }
  ]

  const handlePresetSelect = (preset: DateRangePreset) => {
    setSelectedPreset(preset)
    const range = getDateRange(preset)
    onRangeChange(range.start, range.end)
    setIsOpen(false)
  }

  const currentRange = getDateRange(selectedPreset)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border bg-card hover:bg-background text-sm font-medium text-foreground transition-colors"
      >
        {currentRange.label}
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-lg border border bg-card shadow-lg z-50">
          <div className="p-2 space-y-1">
            {presets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handlePresetSelect(preset.id)}
                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                  selectedPreset === preset.id
                    ? 'bg-accent/20 text-accent font-medium'
                    : 'text-muted-foreground hover:bg-background hover:text-foreground'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
