'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

export type Industry =
  | 'indumentaria'
  | 'calzado'
  | 'deco'
  | 'cosmetica'
  | 'suplementos'
  | 'electronica'
  | 'regaleria'
  | 'alimentos'
  | 'libros'
  | 'otro'

interface IndustryCard {
  id: Industry
  emoji: string
  label: string
}

const INDUSTRIES: IndustryCard[] = [
  { id: 'indumentaria', emoji: '👗', label: 'Indumentaria & Moda' },
  { id: 'calzado', emoji: '👟', label: 'Calzado & Accesorios' },
  { id: 'deco', emoji: '🏠', label: 'Deco & Bazar' },
  { id: 'cosmetica', emoji: '💄', label: 'Cosmética & Cuidado' },
  { id: 'suplementos', emoji: '💊', label: 'Suplementos & Salud' },
  { id: 'electronica', emoji: '📱', label: 'Electrónica & Tech' },
  { id: 'regaleria', emoji: '🎁', label: 'Regalería & Juguetes' },
  { id: 'alimentos', emoji: '🍷', label: 'Alimentos & Bebidas' },
  { id: 'libros', emoji: '📚', label: 'Libros & Papelería' },
  { id: 'otro', emoji: '🔧', label: 'Otro' },
]

interface IndustrySelectorProps {
  onSelect: (industry: Industry) => void
  selected?: Industry
  isVisible: boolean
}

export function IndustrySelector({
  onSelect,
  selected,
  isVisible,
}: IndustrySelectorProps) {
  if (!isVisible) return null

  return (
    <div
      className="space-y-4"
      style={{ animation: 'fadeIn 0.3s ease-out' }}
    >
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          ¿A qué industria pertenece tu tienda?
        </h3>
        <p className="text-sm text-muted-foreground">
          Esto nos ayuda a personalizar el análisis
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {INDUSTRIES.map((industry) => (
          <button
            key={industry.id}
            onClick={() => onSelect(industry.id)}
            className={cn(
              'flex flex-col items-center justify-center gap-2 rounded-lg p-4 transition-all duration-200 border-2',
              selected === industry.id
                ? 'border-chart-1 bg-chart-1/10'
                : 'border/50 bg-card hover:border hover:bg-muted/30',
              'hover:cursor-pointer active:scale-95'
            )}
          >
            <span className="text-3xl">{industry.emoji}</span>
            <span className="text-xs font-medium text-center text-foreground leading-tight">
              {industry.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
