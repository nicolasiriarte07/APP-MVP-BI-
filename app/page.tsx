"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ImportDialog } from "@/components/data-import/import-dialog";
import { MHDashboard } from "@/components/mundohogar/mh-dashboard";
import type { ColumnMapping } from "@/lib/column-detection";
import { BarChart2, Home, Upload, FileUp } from "lucide-react";

export default function DashboardPage() {
  const [importOpen, setImportOpen] = useState(false);
  const [rows, setRows] = useState<Record<string, string>[]>([]);

  const hasData = rows.length > 0;

  function handleImport(imported: Record<string, string>[], _map: ColumnMapping) {
    setRows(imported);
    setImportOpen(false);
  }

  return (
    <div className="flex min-h-screen" style={{ background: "#F8FAFC" }}>
      {/* ── Sidebar ── */}
      <nav
        className="w-[220px] fixed h-screen flex flex-col z-40 border-r"
        style={{ background: "#fff", borderColor: "#F0F0F0", padding: "24px 16px" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-2 mb-8">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "#E91E8C" }}
          >
            <Home size={14} color="#fff" strokeWidth={2.2} />
          </div>
          <div>
            <span className="font-bold text-[14px] block leading-tight" style={{ color: "#0F1419" }}>
              Mundo Hogar
            </span>
            <span className="text-[10px] font-medium" style={{ color: "#94A3B8" }}>Business Intelligence</span>
          </div>
        </div>

        {/* Nav */}
        <div className="flex flex-col gap-0.5 flex-1">
          <div
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold"
            style={{ color: "#E91E8C", background: "#FCE4EC" }}
          >
            <BarChart2 size={15} strokeWidth={2} />
            Dashboard
          </div>
        </div>

        {/* Footer */}
        {!hasData && (
          <div className="pt-4 border-t" style={{ borderColor: "#F0F0F0" }}>
            <Button
              variant="primary"
              size="sm"
              className="w-full justify-center"
              onClick={() => setImportOpen(true)}
            >
              <Upload size={13} />
              Importar CSV
            </Button>
          </div>
        )}
      </nav>

      {/* ── Main ── */}
      <main
        className="flex-1 min-h-screen"
        style={{ marginLeft: "220px", padding: hasData ? "32px 36px" : "80px 36px" }}
      >
        {hasData ? (
          <MHDashboard rows={rows} onReset={() => setRows([])} />
        ) : (
          <EmptyState onImport={() => setImportOpen(true)} />
        )}
      </main>

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
    <div className="max-w-lg mx-auto">
      <Card style={{ border: "1px solid #F0F0F0", borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        <CardContent className="flex flex-col items-center text-center" style={{ padding: "64px 48px" }}>
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
            style={{ background: "#FCE4EC" }}
          >
            <FileUp size={28} style={{ color: "#E91E8C" }} />
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: "#0F1419" }}>
            Importá tu CSV para comenzar
          </h2>
          <p className="text-sm mb-6 leading-relaxed" style={{ color: "#64748B" }}>
            Subí el archivo de ventas de Mundo Hogar y el dashboard va a calcular
            automáticamente todas las métricas, gráficos y comparaciones.
          </p>
          <div
            className="mb-6 text-xs text-left rounded-xl p-4 border w-full"
            style={{ borderColor: "#F0F0F0", background: "#F8FAFC", color: "#94A3B8", lineHeight: "1.8" }}
          >
            <p className="font-semibold mb-1" style={{ color: "#64748B" }}>Columnas esperadas:</p>
            <p>Nombre_PDF · Tipo_Comprobante · Fecha · Cliente</p>
            <p>Forma_Pago · Articulo · Descripcion · Categoria</p>
            <p>Cantidad · items · IVA_Monto · Subtotal_con_IVA</p>
            <p>Monto_con_IVA_ars · Monto_con_IVA_usd · Vertical</p>
          </div>
          <Button
            variant="primary"
            onClick={onImport}
            style={{ background: "#E91E8C", borderColor: "#E91E8C" }}
          >
            <Upload size={14} />
            Importar datos
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
