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
  ArrowRight,
} from "lucide-react";

// ── Nav ────────────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { label: "Importar Datos",       icon: Upload,      active: true  },
  { label: "Centro de Decisiones", icon: Home,        active: false },
  { label: "Clientes",             icon: Users,       active: false },
  { label: "Crecimiento",          icon: TrendingUp,  active: false },
  { label: "Ingresos",             icon: DollarSign,  active: false },
  { label: "Oportunidades",        icon: Lightbulb,   active: false },
];

// ── Industries ─────────────────────────────────────────────────────────────────

const INDUSTRIES = [
  { id: "indumentaria", label: "Indumentaria & Moda",      emoji: "👗" },
  { id: "calzado",      label: "Calzado & Accesorios",     emoji: "👟" },
  { id: "deco",         label: "Deco & Bazar",             emoji: "🏠" },
  { id: "cosmetica",    label: "Cosmética & Cuidado",      emoji: "💄" },
  { id: "electronica",  label: "Electrónica",              emoji: "💻" },
  { id: "alimentos",    label: "Alimentos & Bebidas",      emoji: "🍕" },
  { id: "deportes",     label: "Deportes & Outdoor",       emoji: "⚽" },
  { id: "juguetes",     label: "Juguetes & Entretenimiento",emoji: "🧸" },
];

// ── Page ───────────────────────────────────────────────────────────────────────

export default function ImportPage() {
  const [file, setFile]         = useState<ParsedFile | null>(null);
  const [loading, setLoading]   = useState(false);
  const [industry, setIndustry] = useState<string | null>(null);
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
      alert("No se pudo leer el archivo. Asegurate de que no esté corrupto.");
    } finally {
      setLoading(false);
    }
  }, []);

  const clearFile = () => {
    setFile(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const canContinue = !!file && !!industry;

  return (
    <div className="flex min-h-screen" style={{ background: "#F5F6F8" }}>

      {/* ── Sidebar ── */}
      <nav
        className="w-[220px] fixed h-screen flex flex-col z-40 border-r"
        style={{ background: "#fff", borderColor: "#E5E7EB", padding: "24px 16px" }}
      >
        {/* Logo */}
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

        {/* Nav */}
        <div className="flex flex-col gap-0.5">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.label}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium w-full text-left transition-colors"
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

      {/* ── Main ── */}
      <main
        className="flex-1"
        style={{ marginLeft: "220px", padding: "40px 48px", maxWidth: "900px" }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            style={{ background: "#D1FAE5" }}
          >
            <Upload size={18} style={{ color: "#059669" }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#111827" }}>
              Importar Datos de Ordenes
            </h1>
            <p className="text-sm" style={{ color: "#6B7280" }}>
              Sube tu CSV de ordenes y comienza el análisis de recompra
            </p>
          </div>
        </div>

        {/* ── Step 1: Archivo ── */}
        <div
          className="rounded-2xl border bg-white p-6 mb-4"
          style={{ borderColor: "#E5E7EB" }}
        >
          <h2 className="text-lg font-semibold mb-1" style={{ color: "#111827" }}>
            1. Selecciona tu archivo CSV
          </h2>
          <p className="text-sm mb-5" style={{ color: "#6B7280" }}>
            Arrastra y suelta o haz clic para seleccionar tu archivo de ordenes
          </p>

          <div
            className="rounded-xl border p-5"
            style={{ borderColor: "#E5E7EB" }}
          >
            <p className="font-semibold mb-0.5" style={{ color: "#111827" }}>
              Importar Datos
            </p>
            <p className="text-sm mb-4" style={{ color: "#6B7280" }}>
              Carga tu archivo CSV de órdenes desde Tiendanube
            </p>

            {file ? (
              /* ── Loaded ── */
              <div
                className="rounded-xl border-2 border-dashed flex flex-col items-center justify-center py-10"
                style={{ borderColor: "#10B981", background: "#F0FDF9" }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                  style={{ background: "#D1FAE5" }}
                >
                  <Check size={22} strokeWidth={2.5} style={{ color: "#059669" }} />
                </div>
                <p className="font-semibold" style={{ color: "#111827" }}>
                  ✓ {file.fileName}
                </p>
                <p className="text-sm mt-0.5 mb-3" style={{ color: "#6B7280" }}>
                  Cargado correctamente · {file.totalRows.toLocaleString("es")} filas
                </p>
                <button
                  className="text-sm underline"
                  style={{ color: "#6B7280" }}
                  onClick={clearFile}
                >
                  Cambiar archivo
                </button>
              </div>
            ) : (
              /* ── Drop zone ── */
              <div
                className="rounded-xl border-2 border-dashed flex flex-col items-center justify-center py-12 cursor-pointer transition-colors"
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
                <Upload size={28} style={{ color: "#10B981" }} className="mb-3" />
                <p className="text-sm font-medium" style={{ color: "#374151" }}>
                  Arrastra tu CSV aquí
                </p>
                <p className="text-xs mt-1" style={{ color: "#9CA3AF" }}>
                  o haz clic para seleccionar · CSV, XLS, XLSX
                </p>
                {loading && (
                  <p className="text-xs mt-2" style={{ color: "#10B981" }}>
                    Procesando…
                  </p>
                )}
              </div>
            )}

            <input
              ref={inputRef}
              type="file"
              accept=".csv,.xls,.xlsx"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
          </div>
        </div>

        {/* ── Step 2: Industria ── */}
        <div
          className="rounded-2xl border bg-white p-6 mb-6"
          style={{ borderColor: "#E5E7EB" }}
        >
          <h2 className="text-lg font-semibold mb-1" style={{ color: "#111827" }}>
            2. Selecciona tu industria
          </h2>
          <p className="text-sm mb-5" style={{ color: "#6B7280" }}>
            Esto ayuda a contextualizar el análisis de recompra
          </p>

          <div className="rounded-xl border p-5" style={{ borderColor: "#E5E7EB" }}>
            <p className="font-semibold mb-0.5" style={{ color: "#111827" }}>
              ¿A qué industria pertenece tu tienda?
            </p>
            <p className="text-sm mb-5" style={{ color: "#6B7280" }}>
              Esto nos ayuda a personalizar el análisis
            </p>

            <div className="grid grid-cols-4 gap-3">
              {INDUSTRIES.map((ind) => {
                const selected = industry === ind.id;
                return (
                  <button
                    key={ind.id}
                    onClick={() => setIndustry(ind.id)}
                    className="rounded-xl border-2 p-4 flex flex-col items-center gap-2 text-sm font-medium transition-all"
                    style={{
                      borderColor: selected ? "#111827" : "#E5E7EB",
                      background:  selected ? "#F9FAFB" : "#fff",
                      color: "#374151",
                    }}
                  >
                    <span className="text-2xl">{ind.emoji}</span>
                    <span className="text-center leading-tight">{ind.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── CTA ── */}
        <div className="flex justify-end">
          <button
            disabled={!canContinue}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all"
            style={{
              background:  canContinue ? "#1F6E66" : "#E5E7EB",
              color:       canContinue ? "#fff"    : "#9CA3AF",
              cursor:      canContinue ? "pointer" : "not-allowed",
            }}
          >
            Continuar al análisis
            <ArrowRight size={15} />
          </button>
        </div>
      </main>
    </div>
  );
}
