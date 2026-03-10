"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ImportDialog } from "@/components/data-import/import-dialog";
import { MHDashboard } from "@/components/mundohogar/mh-dashboard";
import type { ColumnMapping } from "@/lib/column-detection";
import {
  BarChart2,
  Upload,
  Bell,
  Search,
  Home,
  RotateCcw,
  FileUp,
} from "lucide-react";

export default function DashboardPage() {
  const [importOpen, setImportOpen] = useState(false);
  const [rows, setRows] = useState<Record<string, string>[]>([]);

  const hasData = rows.length > 0;

  function handleImport(imported: Record<string, string>[], _map: ColumnMapping) {
    setRows(imported);
    setImportOpen(false);
  }

  return (
    <div className="flex min-h-screen" style={{ background: "var(--background)" }}>
      {/* ── Sidebar ── */}
      <nav
        className="w-[220px] fixed h-screen flex flex-col z-40 border-r"
        style={{
          background: "var(--sidebar)",
          borderColor: "var(--sidebar-border)",
          padding: "24px 16px",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-2 mb-8">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "var(--primary)" }}
          >
            <Home size={15} color="#000" strokeWidth={2.2} />
          </div>
          <div>
            <span className="font-bold text-[15px] block leading-tight" style={{ color: "var(--foreground)" }}>
              Mundo Hogar
            </span>
            <span className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>Business Intelligence</span>
          </div>
        </div>

        {/* Nav */}
        <div className="flex flex-col gap-0.5 flex-1">
          <div
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium"
            style={{ color: "var(--primary)", background: "color-mix(in srgb, var(--primary) 12%, transparent)" }}
          >
            <BarChart2 size={15} strokeWidth={2} />
            Dashboard
          </div>
        </div>

        {/* Info */}
        {hasData && (
          <div className="pt-4 border-t" style={{ borderColor: "var(--sidebar-border)" }}>
            <div
              className="px-3 py-2 rounded-lg text-xs"
              style={{ background: "var(--secondary)", color: "var(--muted-foreground)" }}
            >
              <p className="font-semibold" style={{ color: "var(--foreground)" }}>{rows.length.toLocaleString("es")} registros</p>
              <p>cargados desde CSV</p>
            </div>
          </div>
        )}
      </nav>

      {/* ── Main ── */}
      <main className="flex-1 min-h-screen" style={{ marginLeft: "220px", padding: "32px 36px" }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold" style={{ color: "var(--foreground)" }}>
              Dashboard de Ventas
            </h1>
            <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>
              {hasData
                ? `${rows.length.toLocaleString("es")} registros importados`
                : "Importa tu CSV para comenzar a analizar los datos"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ color: "var(--muted-foreground)" }}
              aria-label="Buscar"
            >
              <Search size={16} />
            </button>
            <button
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ color: "var(--muted-foreground)" }}
              aria-label="Notificaciones"
            >
              <Bell size={16} />
            </button>
            {hasData ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setRows([]); }}
              >
                <RotateCcw size={13} />
                Nuevo CSV
              </Button>
            ) : (
              <Button variant="primary" size="sm" onClick={() => setImportOpen(true)}>
                <Upload size={13} />
                Importar CSV
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        {hasData ? (
          <MHDashboard rows={rows} />
        ) : (
          <EmptyState onImport={() => setImportOpen(true)} />
        )}
      </main>

      {/* Import dialog */}
      <ImportDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImport={handleImport}
      />
    </div>
  );
}

function EmptyState({ onImport }: { onImport: () => void }) {
  return (
    <Card>
      <CardContent
        className="flex flex-col items-center justify-center text-center"
        style={{ padding: "80px 40px" }}
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
          style={{ background: "color-mix(in srgb, var(--primary) 12%, transparent)" }}
        >
          <FileUp size={28} style={{ color: "var(--primary)" }} />
        </div>
        <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--foreground)" }}>
          No hay datos aún
        </h2>
        <p className="text-sm max-w-sm mb-6" style={{ color: "var(--muted-foreground)", lineHeight: "1.6" }}>
          Importa tu archivo CSV con las ventas de Mundo Hogar para visualizar
          métricas, tendencias y análisis de tu negocio.
        </p>
        <div className="mb-4 text-xs text-left rounded-lg p-3 border max-w-sm w-full" style={{ borderColor: "var(--border)", background: "var(--secondary)", color: "var(--muted-foreground)" }}>
          <p className="font-semibold mb-1" style={{ color: "var(--foreground)" }}>Columnas esperadas en el CSV:</p>
          <p>Nombre_PDF · Tipo_Comprobante · Fecha · Cliente</p>
          <p>Forma_Pago · Articulo · Descripcion · Categoria</p>
          <p>Cantidad · items · IVA_Monto · Subtotal_con_IVA</p>
          <p>Monto_con_IVA_ars · Monto_con_IVA_usd · Vertical</p>
        </div>
        <Button variant="primary" onClick={onImport}>
          <Upload size={14} />
          Importar datos
        </Button>
      </CardContent>
    </Card>
  );
}
