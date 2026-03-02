import { ReactNode } from 'react'

export const metadata = {
  title: 'Admin - Documentación de Métricas',
  description: 'Documentación completa de cómo se calculan todas las métricas del MVP',
  robots: 'noindex, nofollow' // Evitar indexación
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return children
}
