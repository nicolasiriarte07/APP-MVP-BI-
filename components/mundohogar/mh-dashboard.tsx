"use client";

import React, { useMemo, useState, useEffect } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LabelList,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DollarSign, ShoppingCart, Users, Package,
  TrendingUp, TrendingDown, CreditCard, Calendar,
  RotateCcw, ShoppingBag, Box,
} from "lucide-react";

// ─── Design tokens ────────────────────────────────────────────────────────────
const PINK        = "#E91E8C";
const PINK_LIGHT  = "#F48FB1";
const PINK_PALE   = "#FCE4EC";
const PINK_MED    = "#F06292";
const PURPLE      = "#9C27B0";
const PURPLE_LIGHT= "#CE93D8";

const PIE_COLORS  = [PINK, PINK_LIGHT, PURPLE, PINK_MED, PURPLE_LIGHT, "#EC407A", "#AB47BC", "#F8BBD9"];
const BAR_COLORS  = [PINK, PINK_MED, PINK_LIGHT, "#EC407A", PURPLE, "#AB47BC", "#F06292", "#AD1457", "#880E4F", "#CE93D8"];

const TOOLTIP_STYLE = {
  background: "#fff",
  border: "1px solid #f0f0f0",
  borderRadius: 10,
  fontSize: 12,
  boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
  color: "#0F1419",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseNum(v: string | undefined): number {
  if (!v) return 0;
  const clean = v.toString().replace(/\s/g, "").replace(/\./g, "").replace(",", ".");
  const n = parseFloat(clean);
  return isNaN(n) ? 0 : n;
}

function parseDate(v: string | undefined): Date | null {
  if (!v) return null;
  const parts = v.split("/");
  if (parts.length === 3) {
    const [d, m, y] = parts;
    const date = new Date(`${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`);
    if (!isNaN(date.getTime())) return date;
  }
  const iso = new Date(v);
  return isNaN(iso.getTime()) ? null : iso;
}

function fmtARS(n: number, compact = false) {
  if (compact) {
    if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
    if (Math.abs(n) >= 1_000)     return `$${(n / 1_000).toFixed(0)}k`;
    return `$${n.toFixed(0)}`;
  }
  return new Intl.NumberFormat("es-AR", {
    style: "currency", currency: "ARS",
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(n);
}

function fmtUSD(n: number, compact = false) {
  if (compact) {
    if (Math.abs(n) >= 1_000_000) return `U$S ${(n / 1_000_000).toFixed(1)}M`;
    if (Math.abs(n) >= 1_000)     return `U$S ${(n / 1_000).toFixed(0)}k`;
    return `U$S ${n.toFixed(2)}`;
  }
  return new Intl.NumberFormat("es-AR", {
    style: "currency", currency: "USD",
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(n);
}

function fmtN(n: number) {
  return new Intl.NumberFormat("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
}

function fmtPct(pct: number) {
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(1)}%`;
}

function dateLabel(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  return date.toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" });
}

const DAYS_ES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const DAYS_ORDER = [1, 2, 3, 4, 5, 6, 0]; // Mon-Sun

// ─── KPI Card ─────────────────────────────────────────────────────────────────

interface KPICardProps {
  label: string;
  value: string;
  pct?: number | null;   // % vs prev period
  icon: React.ReactNode;
  decimals?: boolean;
}

function KPICard({ label, value, pct, icon }: KPICardProps) {
  const isPos = pct != null && pct >= 0;
  const isZero = pct != null && pct === 0;
  return (
    <Card style={{ border: "1px solid #f0f0f0", borderRadius: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <span className="text-[13px] font-medium" style={{ color: "#64748B" }}>{label}</span>
          <span style={{ color: "#CBD5E1" }}>{icon}</span>
        </div>
        <p className="text-[26px] font-bold leading-tight mb-1" style={{ color: "#0F1419" }}>{value}</p>
        {pct != null && (
          <div className="flex items-center gap-1 text-xs">
            {isZero ? null : isPos ? (
              <TrendingUp size={12} style={{ color: "#E91E8C" }} />
            ) : (
              <TrendingDown size={12} style={{ color: "#EF4444" }} />
            )}
            <span style={{ color: isZero ? "#64748B" : isPos ? "#E91E8C" : "#EF4444" }}>
              {fmtPct(pct)}
            </span>
            <span style={{ color: "#94A3B8" }}>vs período anterior</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionCard({ title, subtitle, children }: {
  title: string; subtitle?: string; children: React.ReactNode;
}) {
  return (
    <Card style={{ border: "1px solid #f0f0f0", borderRadius: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
      <CardHeader className="pb-1 pt-5 px-5">
        <CardTitle className="text-[15px] font-semibold" style={{ color: "#0F1419" }}>{title}</CardTitle>
        {subtitle && <p className="text-xs mt-0.5" style={{ color: "#94A3B8" }}>{subtitle}</p>}
      </CardHeader>
      <CardContent className="px-5 pb-5">
        {children}
      </CardContent>
    </Card>
  );
}

// ─── Pie Legend ───────────────────────────────────────────────────────────────

function PieLegend({ items }: { items: { name: string; value: number; pct: number; color: string }[] }) {
  return (
    <div className="flex flex-wrap justify-center gap-x-5 gap-y-1.5 mt-3">
      {items.map((it) => (
        <div key={it.name} className="flex items-center gap-1.5 text-xs">
          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: it.color }} />
          <span style={{ color: "#64748B" }}>{it.name}:</span>
          <span className="font-semibold" style={{ color: "#0F1419" }}>{fmtARS(it.value)}</span>
          <span style={{ color: "#94A3B8" }}>({it.pct.toFixed(1)}%)</span>
        </div>
      ))}
    </div>
  );
}

// ─── Custom Label for Pie ─────────────────────────────────────────────────────

function PieLabel({ cx, cy, midAngle, innerRadius, outerRadius, pct, name }: {
  cx: number; cy: number; midAngle: number; innerRadius: number;
  outerRadius: number; pct: number; name: string;
}) {
  if (pct < 5) return null;
  const RADIAN = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  // outside label
  const ox = cx + (outerRadius + 22) * Math.cos(-midAngle * RADIAN);
  const oy = cy + (outerRadius + 22) * Math.sin(-midAngle * RADIAN);
  return (
    <text x={ox} y={oy} fill="#64748B" fontSize={11} textAnchor={ox > cx ? "start" : "end"} dominantBaseline="central">
      {`${name}: ${pct.toFixed(1)}%`}
    </text>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface ParsedRow {
  nombre: string;
  tipo: string;
  fecha: Date | null;
  cliente: string;
  formaPago: string;
  articulo: string;
  descripcion: string;
  categoria: string;
  cantidad: number;
  items: number;
  ivaMonto: number;
  subtotal: number;
  montoArs: number;
  montoUsd: number;
  vertical: string;
}

// ─── Main component ───────────────────────────────────────────────────────────

interface MHDashboardProps {
  rows: Record<string, string>[];
  onReset?: () => void;
}

export function MHDashboard({ rows, onReset }: MHDashboardProps) {

  // ── Column detection ──────────────────────────────────────────────────────

  const colMap = useMemo(() => {
    const keys = Object.keys(rows[0] ?? {});
    const map: Record<string, string> = {};
    const targets = [
      "Nombre_PDF", "Tipo_Comprobante", "Fecha", "Cliente", "Forma_Pago",
      "Articulo", "Descripcion", "Categoria", "Cantidad", "items",
      "IVA_Monto", "Subtotal_con_IVA", "Monto_con_IVA_ars", "Monto_con_IVA_usd", "Vertical",
    ];
    targets.forEach((t) => {
      const found = keys.find((k) => k.trim().toLowerCase() === t.toLowerCase());
      if (found) map[t] = found;
    });
    return map;
  }, [rows]);

  const get = (row: Record<string, string>, col: string) =>
    row[colMap[col]] ?? row[col];

  // ── Parse all rows ─────────────────────────────────────────────────────────

  const allParsed: ParsedRow[] = useMemo(() =>
    rows.map((r) => ({
      nombre:      get(r, "Nombre_PDF") ?? "",
      tipo:        get(r, "Tipo_Comprobante") ?? "",
      fecha:       parseDate(get(r, "Fecha")),
      cliente:     get(r, "Cliente") ?? "",
      formaPago:   get(r, "Forma_Pago") ?? "",
      articulo:    get(r, "Articulo") ?? "",
      descripcion: get(r, "Descripcion") ?? "",
      categoria:   get(r, "Categoria") ?? "",
      cantidad:    parseNum(get(r, "Cantidad")),
      items:       parseNum(get(r, "items")),
      ivaMonto:    parseNum(get(r, "IVA_Monto")),
      subtotal:    parseNum(get(r, "Subtotal_con_IVA")),
      montoArs:    parseNum(get(r, "Monto_con_IVA_ars")),
      montoUsd:    parseNum(get(r, "Monto_con_IVA_usd")),
      vertical:    get(r, "Vertical") ?? "",
    })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rows]
  );

  // ── Date bounds ────────────────────────────────────────────────────────────

  const { minDate, maxDate } = useMemo(() => {
    const dates = allParsed.map((r) => r.fecha).filter(Boolean) as Date[];
    if (!dates.length) return { minDate: "", maxDate: "" };
    const min = new Date(Math.min(...dates.map((d) => d.getTime())));
    const max = new Date(Math.max(...dates.map((d) => d.getTime())));
    const fmt = (d: Date) => d.toISOString().split("T")[0];
    return { minDate: fmt(min), maxDate: fmt(max) };
  }, [allParsed]);

  // ── State ──────────────────────────────────────────────────────────────────

  const [filterStart, setFilterStart] = useState("");
  const [filterEnd,   setFilterEnd]   = useState("");
  const [currency,    setCurrency]    = useState<"ARS" | "USD">("ARS");
  const [viewMode,    setViewMode]    = useState<"facturacion" | "ventas">("facturacion");
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (minDate && !filterStart) setFilterStart(minDate);
    if (maxDate && !filterEnd)   setFilterEnd(maxDate);
  }, [minDate, maxDate]);

  const amt = (r: ParsedRow) => currency === "ARS" ? r.montoArs : r.montoUsd;
  const fmtMoney = (n: number, compact = false) =>
    currency === "ARS" ? fmtARS(n, compact) : fmtUSD(n, compact);

  // ── Filter helpers ─────────────────────────────────────────────────────────

  function filterByRange(data: ParsedRow[], start: string, end: string): ParsedRow[] {
    if (!start || !end) return data;
    const s = new Date(start);
    const e = new Date(end); e.setHours(23, 59, 59, 999);
    return data.filter((r) => r.fecha && r.fecha >= s && r.fecha <= e);
  }

  function onlyVentas(data: ParsedRow[]): ParsedRow[] {
    return data.filter((r) => {
      const t = r.tipo.toUpperCase();
      return !t.includes("CRÉDITO") && !t.includes("CREDITO") && !t.includes(" NC") && t !== "NC";
    });
  }

  // ── Current period data ────────────────────────────────────────────────────

  const currentAll  = useMemo(() => filterByRange(allParsed, filterStart, filterEnd), [allParsed, filterStart, filterEnd]);
  const currentData = useMemo(() => onlyVentas(currentAll), [currentAll]);

  // ── Previous period data (same duration, immediately before) ──────────────

  const prevData = useMemo(() => {
    if (!filterStart || !filterEnd) return [] as ParsedRow[];
    const s = new Date(filterStart);
    const e = new Date(filterEnd);
    const durMs = e.getTime() - s.getTime();
    const prevEnd   = new Date(s.getTime() - 1);
    const prevStart = new Date(prevEnd.getTime() - durMs);
    const fmtIso = (d: Date) => d.toISOString().split("T")[0];
    return onlyVentas(filterByRange(allParsed, fmtIso(prevStart), fmtIso(prevEnd)));
  }, [allParsed, filterStart, filterEnd]);

  // ── KPI calc helper ────────────────────────────────────────────────────────

  function calcKPIs(data: ParsedRow[]) {
    const totalMoney   = data.reduce((s, r) => s + amt(r), 0);
    const invoices     = new Set(data.map((r) => r.nombre).filter(Boolean)).size;
    const clients      = new Set(data.map((r) => r.cliente).filter(Boolean)).size;
    const totalCant    = data.reduce((s, r) => s + r.cantidad, 0);
    const ticketProm   = invoices > 0 ? totalMoney / invoices : 0;
    const prodPerVenta = invoices > 0 ? totalCant / invoices : 0;
    return { totalMoney, invoices, clients, totalCant, ticketProm, prodPerVenta };
  }

  const kpis     = useMemo(() => calcKPIs(currentData), [currentData, currency]);
  const prevKpis = useMemo(() => calcKPIs(prevData), [prevData, currency]);

  function pctChange(curr: number, prev: number): number | null {
    if (prev === 0) return null;
    return ((curr - prev) / prev) * 100;
  }

  // ── Ventas por día de semana ───────────────────────────────────────────────

  const ventasDia = useMemo(() => {
    const map = new Map<number, { money: number; count: number }>();
    DAYS_ORDER.forEach((d) => map.set(d, { money: 0, count: 0 }));
    currentData.forEach((r) => {
      if (!r.fecha) return;
      const d = r.fecha.getDay();
      const prev = map.get(d) ?? { money: 0, count: 0 };
      map.set(d, { money: prev.money + amt(r), count: prev.count + 1 });
    });
    return DAYS_ORDER.map((d) => ({
      dia: DAYS_ES[d],
      money: map.get(d)?.money ?? 0,
      count: map.get(d)?.count ?? 0,
    })).filter((d) => d.money > 0 || d.count > 0);
  }, [currentData, currency]);

  // ── Tipo de comprobante ────────────────────────────────────────────────────

  const tipoComp = useMemo(() => {
    const map = new Map<string, number>();
    currentAll.forEach((r) => {
      const k = r.tipo || "Sin tipo";
      map.set(k, (map.get(k) ?? 0) + amt(r));
    });
    const total = Array.from(map.values()).reduce((a, b) => a + b, 0);
    return Array.from(map.entries())
      .sort(([, a], [, b]) => b - a)
      .map(([name, value], i) => ({
        name, value,
        pct: total > 0 ? (value / total) * 100 : 0,
        color: PIE_COLORS[i % PIE_COLORS.length],
      }));
  }, [currentAll, currency]);

  // ── Formas de pago ────────────────────────────────────────────────────────

  const formaPago = useMemo(() => {
    const map = new Map<string, number>();
    currentData.forEach((r) => {
      const k = r.formaPago || "Sin especificar";
      map.set(k, (map.get(k) ?? 0) + amt(r));
    });
    const total = Array.from(map.values()).reduce((a, b) => a + b, 0);
    return Array.from(map.entries())
      .sort(([, a], [, b]) => b - a)
      .map(([name, value], i) => ({
        name, value,
        pct: total > 0 ? (value / total) * 100 : 0,
        color: PIE_COLORS[i % PIE_COLORS.length],
      }));
  }, [currentData, currency]);

  // ── Ventas por vertical ───────────────────────────────────────────────────

  const vertical = useMemo(() => {
    const map = new Map<string, number>();
    currentData.forEach((r) => {
      const k = r.vertical || "Sin vertical";
      map.set(k, (map.get(k) ?? 0) + amt(r));
    });
    const total = Array.from(map.values()).reduce((a, b) => a + b, 0);
    return Array.from(map.entries())
      .sort(([, a], [, b]) => b - a)
      .map(([name, value], i) => ({
        name, value,
        pct: total > 0 ? (value / total) * 100 : 0,
        color: PIE_COLORS[i % PIE_COLORS.length],
      }));
  }, [currentData, currency]);

  // ── Top productos ─────────────────────────────────────────────────────────

  const topProductos = useMemo(() => {
    const map = new Map<string, { money: number; cant: number }>();
    currentData.forEach((r) => {
      const k = (r.descripcion || r.articulo || "Sin descripción").trim();
      const prev = map.get(k) ?? { money: 0, cant: 0 };
      map.set(k, { money: prev.money + amt(r), cant: prev.cant + r.cantidad });
    });
    return Array.from(map.entries())
      .sort(([, a], [, b]) => b.money - a.money)
      .slice(0, 10)
      .map(([desc, v]) => ({
        desc: desc.length > 28 ? desc.slice(0, 26) + "…" : desc,
        money: v.money,
        cant: v.cant,
      }));
  }, [currentData, currency]);

  // ── Ventas por categoría ──────────────────────────────────────────────────

  const categoria = useMemo(() => {
    const map = new Map<string, number>();
    currentData.forEach((r) => {
      const k = r.categoria || "Sin categoría";
      map.set(k, (map.get(k) ?? 0) + amt(r));
    });
    return Array.from(map.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 15)
      .map(([cat, money]) => ({ cat, money }));
  }, [currentData, currency]);

  // ── Comparación interanual ────────────────────────────────────────────────

  const interanual = useMemo(() => {
    const yearMonthMap = new Map<string, number>();
    allParsed.forEach((r) => {
      if (!r.fecha) return;
      const y = r.fecha.getFullYear();
      const m = r.fecha.getMonth() + 1;
      const key = `${y}-${String(m).padStart(2, "0")}`;
      yearMonthMap.set(key, (yearMonthMap.get(key) ?? 0) + amt(r));
    });

    const years = Array.from(new Set(
      allParsed.map((r) => r.fecha?.getFullYear()).filter(Boolean)
    )).sort() as number[];

    const months = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
    return months.map((mes, idx) => {
      const entry: Record<string, number | string> = { mes };
      years.forEach((y) => {
        const key = `${y}-${String(idx + 1).padStart(2, "0")}`;
        entry[String(y)] = yearMonthMap.get(key) ?? 0;
      });
      return entry;
    });
  }, [allParsed, currency]);

  const interanualYears = useMemo(() =>
    Array.from(new Set(allParsed.map((r) => r.fecha?.getFullYear()).filter(Boolean))).sort() as number[],
    [allParsed]
  );

  const yearColors = [PINK, PINK_LIGHT, PURPLE, PINK_MED];

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">

      {/* ── Header controls ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#0F1419" }}>Dashboard de Ventas</h1>
          <p className="text-sm mt-0.5" style={{ color: "#64748B" }}>Análisis completo de ventas y facturación</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* ARS / USD toggle */}
          <div className="flex rounded-full border overflow-hidden" style={{ borderColor: "#E2E8F0" }}>
            {(["ARS", "USD"] as const).map((c) => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className="px-4 py-1.5 text-sm font-semibold transition-colors"
                style={{
                  background: currency === c ? PINK : "#fff",
                  color: currency === c ? "#fff" : "#64748B",
                }}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Facturación / Ventas toggle */}
          <div className="flex rounded-full border overflow-hidden" style={{ borderColor: "#E2E8F0" }}>
            <button
              onClick={() => setViewMode("facturacion")}
              className="px-4 py-1.5 text-sm font-semibold transition-colors"
              style={{
                background: viewMode === "facturacion" ? PINK : "#fff",
                color: viewMode === "facturacion" ? "#fff" : "#64748B",
              }}
            >
              Facturación
            </button>
            <button
              onClick={() => setViewMode("ventas")}
              className="px-4 py-1.5 text-sm font-semibold transition-colors"
              style={{
                background: viewMode === "ventas" ? PINK : "#fff",
                color: viewMode === "ventas" ? "#fff" : "#64748B",
              }}
            >
              Ventas
            </button>
          </div>

          {/* Reset */}
          {onReset && (
            <button
              onClick={onReset}
              className="text-sm px-3 py-1.5 rounded-full border transition-colors hover:bg-slate-50"
              style={{ borderColor: "#E2E8F0", color: "#64748B" }}
            >
              Cargar otro archivo
            </button>
          )}

          {/* Date range display / picker */}
          <div className="relative">
            <button
              onClick={() => setShowDatePicker((v) => !v)}
              className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-full border transition-colors hover:bg-slate-50"
              style={{ borderColor: "#E2E8F0", color: "#64748B" }}
            >
              <Calendar size={13} />
              {filterStart && filterEnd
                ? `${dateLabel(filterStart)} - ${dateLabel(filterEnd)}`
                : "Seleccionar período"}
            </button>

            {showDatePicker && (
              <div
                className="absolute right-0 top-10 z-50 rounded-xl border p-4 shadow-xl flex flex-col gap-3"
                style={{ background: "#fff", borderColor: "#E2E8F0", minWidth: 280 }}
              >
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: "#64748B" }}>Desde</label>
                  <input
                    type="date"
                    value={filterStart}
                    min={minDate}
                    max={filterEnd || maxDate}
                    onChange={(e) => setFilterStart(e.target.value)}
                    className="w-full text-sm border rounded-lg px-3 py-1.5 focus:outline-none"
                    style={{ borderColor: "#E2E8F0", color: "#0F1419" }}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: "#64748B" }}>Hasta</label>
                  <input
                    type="date"
                    value={filterEnd}
                    min={filterStart || minDate}
                    max={maxDate}
                    onChange={(e) => setFilterEnd(e.target.value)}
                    className="w-full text-sm border rounded-lg px-3 py-1.5 focus:outline-none"
                    style={{ borderColor: "#E2E8F0", color: "#0F1419" }}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setFilterStart(minDate); setFilterEnd(maxDate); }}
                    className="flex-1 text-xs py-1.5 rounded-lg border"
                    style={{ borderColor: "#E2E8F0", color: "#64748B" }}
                  >
                    Todo el período
                  </button>
                  <button
                    onClick={() => setShowDatePicker(false)}
                    className="flex-1 text-xs py-1.5 rounded-lg text-white font-semibold"
                    style={{ background: PINK }}
                  >
                    Aplicar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <KPICard
          label="Facturación Total"
          value={fmtMoney(kpis.totalMoney)}
          pct={pctChange(kpis.totalMoney, prevKpis.totalMoney)}
          icon={<DollarSign size={20} />}
        />
        <KPICard
          label="Total Ventas"
          value={fmtN(kpis.invoices)}
          pct={pctChange(kpis.invoices, prevKpis.invoices)}
          icon={<ShoppingCart size={20} />}
        />
        <KPICard
          label="Ticket Promedio"
          value={fmtMoney(kpis.ticketProm)}
          pct={pctChange(kpis.ticketProm, prevKpis.ticketProm)}
          icon={<CreditCard size={20} />}
        />
        <KPICard
          label="Productos por Venta"
          value={kpis.prodPerVenta.toFixed(2).replace(".", ",")}
          pct={pctChange(kpis.prodPerVenta, prevKpis.prodPerVenta)}
          icon={<ShoppingBag size={20} />}
        />
        <KPICard
          label="Clientes Únicos"
          value={fmtN(kpis.clients)}
          pct={pctChange(kpis.clients, prevKpis.clients)}
          icon={<Users size={20} />}
        />
        <KPICard
          label="Productos Vendidos"
          value={fmtN(kpis.totalCant)}
          pct={pctChange(kpis.totalCant, prevKpis.totalCant)}
          icon={<Box size={20} />}
        />
      </div>

      {/* ── Row: Día de semana + Tipo comprobante ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <SectionCard
          title={viewMode === "facturacion" ? "Facturación por Día de la Semana" : "Ventas por Día de la Semana"}
          subtitle={`${viewMode === "facturacion" ? "Facturación" : "Cantidad de ventas"} en ${currency} agrupada por día de la semana`}
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={ventasDia} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="dia" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 10, fill: "#94A3B8" }}
                axisLine={false} tickLine={false}
                tickFormatter={(v) => viewMode === "facturacion" ? fmtMoney(v, true) : fmtN(v)}
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(v: number) =>
                  viewMode === "facturacion"
                    ? [fmtMoney(v), "Facturación"]
                    : [fmtN(v), "Ventas"]
                }
              />
              <Bar
                dataKey={viewMode === "facturacion" ? "money" : "count"}
                fill={PINK}
                radius={[5, 5, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Tipo de Comprobante" subtitle="Distribución de facturación por tipo">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={tipoComp}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="48%"
                outerRadius={95}
                paddingAngle={2}
                labelLine={false}
                label={PieLabel}
              >
                {tipoComp.map((t, i) => (
                  <Cell key={i} fill={t.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(v: number, name: string, props) => [
                  `${fmtMoney(v)} (${props.payload.pct.toFixed(1)}%)`,
                  name,
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
          <PieLegend items={tipoComp} />
        </SectionCard>
      </div>

      {/* ── Row: Formas de pago + Vertical ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <SectionCard title="Formas de Pago" subtitle="Distribución de ventas por método de pago">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={formaPago}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="48%"
                outerRadius={95}
                paddingAngle={2}
                labelLine={false}
                label={PieLabel}
              >
                {formaPago.map((fp, i) => (
                  <Cell key={i} fill={fp.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(v: number, name: string, props) => [
                  `${fmtMoney(v)} (${props.payload.pct.toFixed(1)}%)`,
                  name,
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
          <PieLegend items={formaPago} />
        </SectionCard>

        <SectionCard title="Ventas por Vertical" subtitle="Distribución de ventas por vertical">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={vertical}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="48%"
                outerRadius={95}
                paddingAngle={2}
                labelLine={false}
                label={PieLabel}
              >
                {vertical.map((v, i) => (
                  <Cell key={i} fill={v.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(v: number, name: string, props) => [
                  `${fmtMoney(v)} (${props.payload.pct.toFixed(1)}%)`,
                  name,
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
          <PieLegend items={vertical} />
        </SectionCard>
      </div>

      {/* ── Row: Top productos + Categoría ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <SectionCard title="Top 10 Productos" subtitle="Productos con mayor facturación">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={topProductos} layout="vertical" margin={{ top: 0, right: 40, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
              <XAxis
                type="number"
                tick={{ fontSize: 10, fill: "#94A3B8" }}
                axisLine={false} tickLine={false}
                tickFormatter={(v) => fmtMoney(v, true)}
              />
              <YAxis
                type="category"
                dataKey="desc"
                tick={{ fontSize: 10, fill: "#64748B" }}
                axisLine={false} tickLine={false}
                width={140}
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(v: number) => [fmtMoney(v), "Facturación"]}
              />
              <Bar dataKey="money" fill={PINK} radius={[0, 5, 5, 0]}>
                <LabelList
                  dataKey="money"
                  position="right"
                  formatter={(v: number) => fmtMoney(v, true)}
                  style={{ fontSize: 10, fill: "#94A3B8" }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard
          title="Facturación por Categoría"
          subtitle={`Facturación en ${currency} agrupada por categoría de producto`}
        >
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={categoria} margin={{ top: 10, right: 10, left: 0, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis
                dataKey="cat"
                tick={{ fontSize: 10, fill: "#94A3B8" }}
                axisLine={false} tickLine={false}
                angle={-35}
                textAnchor="end"
                interval={0}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#94A3B8" }}
                axisLine={false} tickLine={false}
                tickFormatter={(v) => fmtMoney(v, true)}
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(v: number) => [fmtMoney(v), "Facturación"]}
              />
              <Bar dataKey="money" fill={PINK} radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      {/* ── Comparación Interanual ── */}
      {interanualYears.length > 0 && (
        <SectionCard
          title="Comparación Interanual"
          subtitle={`Comparación de facturación mensual en ${currency} entre ${interanualYears.join(" y ")}`}
        >
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={interanual} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 10, fill: "#94A3B8" }}
                axisLine={false} tickLine={false}
                tickFormatter={(v) => fmtMoney(v, true)}
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(v: number, name: string) => [fmtMoney(v), name]}
              />
              <Legend
                wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
                formatter={(value) => <span style={{ color: "#64748B" }}>{value}</span>}
              />
              {interanualYears.map((y, i) => (
                <Line
                  key={y}
                  type="monotone"
                  dataKey={String(y)}
                  stroke={yearColors[i % yearColors.length]}
                  strokeWidth={2}
                  dot={{ r: 3, fill: yearColors[i % yearColors.length] }}
                  activeDot={{ r: 5 }}
                  strokeOpacity={i === interanualYears.length - 1 ? 1 : 0.45}
                  strokeDasharray={i < interanualYears.length - 1 ? "0" : "0"}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </SectionCard>
      )}

    </div>
  );
}
