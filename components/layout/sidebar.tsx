'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart3, Home, Users, TrendingUp, DollarSign, Lightbulb, Menu, X, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'

const navigationItems = [
  { href: '/import', label: 'Importar Datos', icon: Upload },
  { href: '/home', label: 'Centro de Decisiones', icon: Home },
  { href: '/customers', label: 'Clientes', icon: Users },
  { href: '/growth', label: 'Crecimiento', icon: TrendingUp },
  { href: '/revenue', label: 'Ingresos', icon: DollarSign },
  { href: '/opportunities', label: 'Oportunidades', icon: Lightbulb },
]

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Mobile menu button */}
      <div className="fixed top-4 left-4 z-50 lg:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="bg-transparent"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 bottom-0 w-64 bg-card border-r border transform transition-transform duration-200 z-40 lg:relative lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="rounded-lg bg-accent/10 p-2">
              <BarChart3 className="h-6 w-6 text-accent" />
            </div>
            <h1 className="text-lg font-bold text-foreground">Nexo</h1>
          </div>

          <nav className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname.includes(item.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
