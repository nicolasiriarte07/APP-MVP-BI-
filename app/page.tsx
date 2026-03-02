"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { ImportDialog } from "@/components/data-import/import-dialog";
import type { ColumnMapping } from "@/lib/column-detection";
import {
  LayoutDashboard,
  Database,
  BarChart2,
  FileText,
  Settings,
  Upload,
  Bell,
  Search,
  Users,
  DollarSign,
  FileUp,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard",     href: "#",          icon: LayoutDashboard, active: true },
  { label: "Datos",         href: "#datos",     icon: Database                      },
  { label: "Análisis",      href: "#analisis",  icon: BarChart2                     },
  { label: "Reportes",      href: "#reportes",  icon: FileText                      },
  { label: "Configuración", href: "#config",    icon: Settings                      },
];

export default function DashboardPage() {
  const [importOpen, setImportOpen]     = useState(false);
  const [rows, setRows]                 = useState<Record<string, string>[]>([]);
  const [mapping, setMapping]           = useState<ColumnMapping | null>(null);

  const hasData = rows.length > 0;

  function handleImport(imported: Record<string, string>[], map: ColumnMapping) {
    setRows(imported);
    setMapping(map);
    setImportOpen(false);
  }

  return (
    <div className="flex min-h-screen" style={{ background: "var(--bg-body)" }}>
      {/* ── Sidebar ── */}
      <nav
        className="w-[220px] fixed h-screen flex flex-col z-40 border-r"
        style={{
          background: "var(--bg-surface)",
          borderColor: "var(--secondary-200)",
          padding: "24px 16px",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-2 mb-8">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "var(--primary-600)" }}
          >
            <BarChart2 size={15} color="#fff" strokeWidth={2.2} />
          </div>
          <span className="font-bold text-[15px]" style={{ color: "var(--secondary-900)" }}>
            BI Platform
          </span>
        </div>

        {/* Nav links */}
        <div className="flex flex-col gap-0.5 flex-1">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-sm)] text-sm font-medium transition-colors"
              style={{
                color:      item.active ? "var(--primary-600)" : "var(--secondary-600)",
                background: item.active ? "var(--primary-50)"  : "transparent",
              }}
            >
              <item.icon size={15} strokeWidth={2} />
              {item.label}
            </a>
          ))}
        </div>

        {/* User */}
        <div className="pt-4 border-t" style={{ borderColor: "var(--secondary-200)" }}>
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-[var(--radius-sm)]"
            style={{ background: "var(--secondary-50)" }}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={{ background: "var(--primary-600)", color: "#fff" }}
            >
              U
            </div>
            <div>
              <div className="text-[13px] font-semibold leading-tight" style={{ color: "var(--secondary-900)" }}>
                Usuario
              </div>
              <div className="text-[11px]" style={{ color: "var(--secondary-500)" }}>
                Admin
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Main ── */}
      <main className="flex-1 min-h-screen" style={{ marginLeft: "220px", padding: "36px 40px" }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--secondary-900)" }}>
              Dashboard
            </h1>
            <p className="text-sm mt-0.5" style={{ color: "var(--secondary-500)" }}>
              {hasData
                ? `${rows.length.toLocaleString("es")} registros importados`
                : "Sin datos — importa un archivo para comenzar"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ color: "var(--secondary-500)" }}
              aria-label="Buscar"
            >
              <Search size={16} />
            </button>
            <button
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ color: "var(--secondary-500)" }}
              aria-label="Notificaciones"
            >
              <Bell size={16} />
            </button>
            <Button variant="primary" size="sm" onClick={() => setImportOpen(true)}>
              <Upload size={13} />
              Importar datos
            </Button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <StatCard
            value={hasData ? rows.length.toLocaleString("es") : "—"}
            label="Registros totales"
            icon={<Database size={17} style={{ color: "var(--primary-600)" }} />}
          />
          <StatCard
            value={hasData && mapping ? Object.keys(mapping).filter((k) => mapping[k as keyof ColumnMapping]).length.toString() : "—"}
            label="Columnas mapeadas"
            icon={<FileText size={17} style={{ color: "var(--primary-600)" }} />}
          />
          <StatCard
            value="—"
            label="Usuarios activos"
            icon={<Users size={17} style={{ color: "var(--primary-600)" }} />}
          />
          <StatCard
            value="—"
            label="Ingresos totales"
            icon={<DollarSign size={17} style={{ color: "var(--primary-600)" }} />}
          />
        </div>

        {/* Content */}
        {hasData ? (
          <DataPreview rows={rows} />
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

/* ── Empty state ── */
function EmptyState({ onImport }: { onImport: () => void }) {
  return (
    <Card>
      <CardContent
        className="flex flex-col items-center justify-center text-center"
        style={{ padding: "80px 40px" }}
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
          style={{ background: "var(--primary-50)" }}
        >
          <FileUp size={28} style={{ color: "var(--primary-600)" }} />
        </div>
        <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--secondary-900)" }}>
          No hay datos aún
        </h2>
        <p
          className="text-sm max-w-sm mb-6"
          style={{ color: "var(--secondary-500)", lineHeight: "1.6" }}
        >
          Importa tu primer archivo CSV o Excel para comenzar a visualizar y
          analizar tu información.
        </p>
        <Button variant="primary" onClick={onImport}>
          <Upload size={14} />
          Importar datos
        </Button>
      </CardContent>
    </Card>
  );
}

/* ── Data preview table ── */
function DataPreview({ rows }: { rows: Record<string, string>[] }) {
  const cols = Object.keys(rows[0] ?? {});
  const preview = rows.slice(0, 50);

  return (
    <Card>
      <CardContent style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr style={{ background: "var(--secondary-50)", borderBottom: "2px solid var(--secondary-200)" }}>
                {cols.map((col) => (
                  <th
                    key={col}
                    className="px-4 py-3 text-xs font-semibold uppercase tracking-wide whitespace-nowrap"
                    style={{ color: "var(--secondary-500)" }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {preview.map((row, i) => (
                <tr
                  key={i}
                  style={{ borderBottom: "1px solid var(--secondary-100)" }}
                >
                  {cols.map((col) => (
                    <td
                      key={col}
                      className="px-4 py-2.5 whitespace-nowrap"
                      style={{ color: "var(--secondary-800)" }}
                    >
                      {row[col] ?? ""}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length > 50 && (
          <div
            className="px-4 py-3 text-xs text-center border-t"
            style={{ color: "var(--secondary-500)", borderColor: "var(--secondary-200)" }}
          >
            Mostrando 50 de {rows.length.toLocaleString("es")} registros
          </div>
        )}
      </CardContent>
    </Card>
  );
}
