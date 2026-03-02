"use client";

import React, { useState, useRef, useCallback } from "react";
import { parseFile, isSupportedFile } from "@/lib/file-parser";
import type { ParsedFile } from "@/lib/file-parser";
import {
  BarChart2,
  Upload,
  Home,
  Users,
  TrendingUp,
  DollarSign,
  Lightbulb,
  Check,
  RefreshCw,
  Table2,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Importar Datos",       icon: Upload,      active: true  },
  { label: "Centro de Decisiones", icon: Home,        active: false },
  { label: "Clientes",             icon: Users,       active: false },
  { label: "Crecimiento",          icon: TrendingUp,  active: false },
  { label: "Ingresos",             icon: DollarSign,  active: false },
  { label: "Oportunidades",        icon: Lightbulb,   active: false },
];

const PREVIEW_ROWS = 8;

export default function ImportPage() {
  const [file, setFile]         = useState<ParsedFile | null>(null);
  const [loading, setLoading]   = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (f: File) => {
    if (!isSupportedFile(f)) {
      alert("Formato no soportado. Usá CSV, XLS o XLSX.");
      return;
    }
    setLoading(true);
    try {
      const parsed = await parseFile(f);
      setFile(parsed);
    } catch {
      alert("No se pudo leer el archivo.");
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = () => {
    setFile(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="flex min-h-screen" style={{ background: "#F5F6F8" }}>

      {/* Sidebar */}
      <nav
        className="w-[220px] fixed h-screen flex flex-col z-40 border-r"
        style={{ background: "#fff", borderColor: "#E5E7EB", padding: "24px 16px" }}
      >
        <div className="flex items-center gap-2 px-2 mb-8">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "#1F6E66" }}
          >
            <BarChart2 size={15} color="#fff" strokeWidth={2.2} />
          </div>
          <span className="font-bold text-[15px]" style={{ color: "#111827" }}>
            Nexo
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.label}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium w-full text-left"
              style={{
                color:      item.active ? "#1F6E66" : "#6B7280",
                background: item.active ? "#F0FDF9" : "transparent",
              }}
            >
              <item.icon size={15} strokeWidth={2} />
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Main */}
      <main style={{ marginLeft: "220px", padding: "40px 48px", width: "100%" }}>

        {!file ? (
          /* ── Upload view ── */
          <>
            <div className="flex items-center gap-3 mb-8">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "#D1FAE5" }}
              >
                <Upload size={18} style={{ color: "#059669" }} />
              </div>
              <div>
                <h1 className="text-2xl font-bold" style={{ color: "#111827" }}>
                  Importar Datos de Órdenes
                </h1>
                <p className="text-sm" style={{ color: "#6B7280" }}>
                  Subí tu CSV de Tiendanube y comenzá el análisis de recompra
                </p>
              </div>
            </div>

            <div
              className="rounded-2xl border bg-white p-8"
              style={{ borderColor: "#E5E7EB", maxWidth: "600px" }}
            >
              <p className="font-semibold mb-1" style={{ color: "#111827" }}>
                Seleccionar archivo
              </p>
              <p className="text-sm mb-5" style={{ color: "#6B7280" }}>
                Formatos soportados: CSV, XLS, XLSX
              </p>

              <div
                className="rounded-xl border-2 border-dashed flex flex-col items-center justify-center py-14 cursor-pointer transition-colors"
                style={{
                  borderColor: dragging ? "#10B981" : "#A7F3D0",
                  background:  dragging ? "#ECFDF5" : "#F0FDF9",
                }}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  const f = e.dataTransfer.files[0];
                  if (f) handleFile(f);
                }}
                onClick={() => inputRef.current?.click()}
              >
                {loading ? (
                  <>
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center mb-3 animate-spin"
                      style={{ border: "3px solid #D1FAE5", borderTopColor: "#10B981" }}
                    />
                    <p className="text-sm font-medium" style={{ color: "#374151" }}>
                      Procesando…
                    </p>
                  </>
                ) : (
                  <>
                    <Upload size={30} style={{ color: "#10B981" }} className="mb-3" />
                    <p className="text-sm font-medium" style={{ color: "#374151" }}>
                      Arrastrá tu archivo aquí
                    </p>
                    <p className="text-xs mt-1" style={{ color: "#9CA3AF" }}>
                      o hacé clic para seleccionar
                    </p>
                  </>
                )}
              </div>

              <input
                ref={inputRef}
                type="file"
                accept=".csv,.xls,.xlsx"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
              />
            </div>
          </>
        ) : (
          /* ── Data view ── */
          <>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: "#D1FAE5" }}
                >
                  <Check size={18} style={{ color: "#059669" }} strokeWidth={2.5} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold" style={{ color: "#111827" }}>
                    {file.fileName}
                  </h1>
                  <p className="text-sm" style={{ color: "#6B7280" }}>
                    {file.totalRows.toLocaleString("es")} filas · {file.headers.length} columnas · hoja: {file.sheetName}
                  </p>
                </div>
              </div>
              <button
                onClick={reset}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border"
                style={{ borderColor: "#E5E7EB", background: "#fff", color: "#6B7280" }}
              >
                <RefreshCw size={13} />
                Nuevo archivo
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: "Total filas", value: file.totalRows.toLocaleString("es") },
                { label: "Columnas",    value: file.headers.length },
                { label: "Hoja",        value: file.sheetName },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl border bg-white p-5"
                  style={{ borderColor: "#E5E7EB" }}
                >
                  <p className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: "#9CA3AF" }}>
                    {s.label}
                  </p>
                  <p className="text-2xl font-bold" style={{ color: "#111827" }}>
                    {s.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Columns */}
            <div
              className="rounded-xl border bg-white p-5 mb-6"
              style={{ borderColor: "#E5E7EB" }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Table2 size={15} style={{ color: "#6B7280" }} />
                <p className="text-sm font-semibold" style={{ color: "#111827" }}>
                  Columnas detectadas
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {file.headers.map((h) => (
                  <span
                    key={h}
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{ background: "#F0FDF9", color: "#1F6E66", border: "1px solid #A7F3D0" }}
                  >
                    {h}
                  </span>
                ))}
              </div>
            </div>

            {/* Preview table */}
            <div
              className="rounded-xl border bg-white overflow-hidden"
              style={{ borderColor: "#E5E7EB" }}
            >
              <div className="px-5 py-4 border-b" style={{ borderColor: "#E5E7EB" }}>
                <p className="text-sm font-semibold" style={{ color: "#111827" }}>
                  Vista previa — primeras {Math.min(PREVIEW_ROWS, file.rows.length)} filas
                </p>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ background: "#F9FAFB" }}>
                      {file.headers.map((h) => (
                        <th
                          key={h}
                          className="text-left px-4 py-3 font-semibold whitespace-nowrap"
                          style={{ color: "#374151", borderBottom: "1px solid #E5E7EB" }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {file.rows.slice(0, PREVIEW_ROWS).map((row, i) => (
                      <tr
                        key={i}
                        style={{ borderBottom: "1px solid #F3F4F6" }}
                      >
                        {file.headers.map((h) => (
                          <td
                            key={h}
                            className="px-4 py-2.5 whitespace-nowrap"
                            style={{ color: "#6B7280", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis" }}
                          >
                            {row[h] ?? ""}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
