"use client";

import React, { useMemo, useState } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DollarSign, ShoppingCart, Users, Package,
  TrendingUp, CreditCard, Calendar, BarChart2,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Row {
  Nombre_PDF?: string;
  Tipo_Comprobante?: string;
  Fecha?: string;
  Cliente?: string;
  Forma_Pago?: string;
  Articulo?: string;
  Descripcion?: string;
  Categoria?: string;
  Cantidad?: string;
  items?: string;
  IVA_Monto?: string;
  Subtotal_con_IVA?: string;
  Monto_con_IVA_ars?: string;
  Monto_con_IVA_usd?: string;
  Vertical?: string;
  [key: string]: string | undefined;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseNum(v: string | undefined): number {
  if (!v) return 0;
  // Remove thousands separators (. or ,) and normalize decimal
  const clean = v.toString().replace(/\s/g, "").replace(/\./g, "").replace(",", ".");
  const n = parseFloat(clean);
  return isNaN(n) ? 0 : n;
}

function parseDate(v: string | undefined): Date | null {
  if (!v) return null;
  // Try DD/MM/YYYY
  const parts = v.split("/");
  if (parts.length === 3) {
    const [d, m, y] = parts;
    const date = new Date(`${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`);
    if (!isNaN(date.getTime())) return date;
  }
  // Try ISO
  const iso = new Date(v);
  return isNaN(iso.getTime()) ? null : iso;
}

function fmtARS(n: number) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
}

function fmtUSD(n: number) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

function fmtN(n: number) {
  return new Intl.NumberFormat("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
}

const CHART_COLORS = [
  "#01d280", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6",
  "#06B6D4", "#EC4899", "#10B981", "#F97316", "#6366F1",
];

// ─── Sub-components ───────────────────────────────────────────────────────────

interface KPICardProps {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  color?: string;
}

function KPICard({ label, value, sub, icon, color = "#01d280" }: KPICardProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: "var(--muted-foreground)" }}>
              {label}
            </p>
            <p className="text-2xl font-bold truncate" style={{ color: "var(--foreground)" }}>
              {value}
            </p>
            {sub && (
              <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
                {sub}
              </p>
            )}
          </div>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ml-3"
            style={{ background: `${color}22` }}
          >
            <span style={{ color }}>{icon}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label, currency = "ARS" }: {
  active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string; currency?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-lg shadow-lg p-3 text-sm border"
      style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)" }}
    >
      {label && <p className="font-semibold mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: {currency === "ARS" ? fmtARS(p.value) : fmtUSD(p.value)}
        </p>
      ))}
    </div>
  );
}

function CustomPieTooltip({ active, payload }: {
  active?: boolean; payload?: { name: string; value: number; payload: { pct: number } }[];
}) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div
      className="rounded-lg shadow-lg p-3 text-sm border"
      style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)" }}
    >
      <p className="font-semibold">{p.name}</p>
      <p>{fmtARS(p.value)}</p>
      <p style={{ color: "var(--muted-foreground)" }}>{p.payload.pct.toFixed(1)}%</p>
    </div>
  );
}

// ─── Date Filter ──────────────────────────────────────────────────────────────

interface DateFilterProps {
  minDate: string;
  maxDate: string;
  start: string;
  end: string;
  onChange: (start: string, end: string) => void;
}

function DateFilter({ minDate, maxDate, start, end, onChange }: DateFilterProps) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-2">
        <Calendar size={14} style={{ color: "var(--muted-foreground)" }} />
        <span className="text-sm font-medium" style={{ color: "var(--muted-foreground)" }}>Filtrar por fecha:</span>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={start}
          min={minDate}
          max={maxDate}
          onChange={(e) => onChange(e.target.value, end)}
          className="text-sm border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2"
          style={{
            background: "var(--input)", borderColor: "var(--border)",
            color: "var(--foreground)", focusRingColor: "var(--ring)",
          }}
        />
        <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>—</span>
        <input
          type="date"
          value={end}
          min={minDate}
          max={maxDate}
          onChange={(e) => onChange(start, e.target.value)}
          className="text-sm border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2"
          style={{
            background: "var(--input)", borderColor: "var(--border)",
            color: "var(--foreground)",
          }}
        />
        {(start !== minDate || end !== maxDate) && (
          <button
            onClick={() => onChange(minDate, maxDate)}
            className="text-xs px-2 py-1 rounded-md"
            style={{ background: "var(--secondary)", color: "var(--secondary-foreground)" }}
          >
            Limpiar
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

interface MHDashboardProps {
  rows: Record<string, string>[];
}

export function MHDashboard({ rows }: MHDashboardProps) {
  // Detect column names (case-insensitive + trim)
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

  const get = (row: Record<string, string>, col: string): string | undefined =>
    row[colMap[col]] ?? row[col];

  // Parse rows
  const parsed = useMemo(() =>
    rows.map((r) => ({
      raw: r,
      nombre: get(r, "Nombre_PDF") ?? "",
      tipo: get(r, "Tipo_Comprobante") ?? "",
      fecha: parseDate(get(r, "Fecha")),
      fechaStr: get(r, "Fecha") ?? "",
      cliente: get(r, "Cliente") ?? "",
      formaPago: get(r, "Forma_Pago") ?? "",
      articulo: get(r, "Articulo") ?? "",
      descripcion: get(r, "Descripcion") ?? "",
      categoria: get(r, "Categoria") ?? "",
      cantidad: parseNum(get(r, "Cantidad")),
      items: parseNum(get(r, "items")),
      ivaMonto: parseNum(get(r, "IVA_Monto")),
      subtotal: parseNum(get(r, "Subtotal_con_IVA")),
      montoArs: parseNum(get(r, "Monto_con_IVA_ars")),
      montoUsd: parseNum(get(r, "Monto_con_IVA_usd")),
      vertical: get(r, "Vertical") ?? "",
    })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rows]
  );

  // Date bounds
  const { minDate, maxDate } = useMemo(() => {
    const dates = parsed.map((r) => r.fecha).filter(Boolean) as Date[];
    if (!dates.length) return { minDate: "", maxDate: "" };
    const min = new Date(Math.min(...dates.map((d) => d.getTime())));
    const max = new Date(Math.max(...dates.map((d) => d.getTime())));
    const fmt = (d: Date) => d.toISOString().split("T")[0];
    return { minDate: fmt(min), maxDate: fmt(max) };
  }, [parsed]);

  const [filterStart, setFilterStart] = useState("");
  const [filterEnd, setFilterEnd] = useState("");

  // Sync defaults
  React.useEffect(() => {
    if (minDate && !filterStart) setFilterStart(minDate);
    if (maxDate && !filterEnd) setFilterEnd(maxDate);
  }, [minDate, maxDate]);

  // Filtered rows
  const data = useMemo(() => {
    if (!filterStart || !filterEnd) return parsed;
    const s = new Date(filterStart);
    const e = new Date(filterEnd);
    e.setHours(23, 59, 59, 999);
    return parsed.filter((r) => r.fecha && r.fecha >= s && r.fecha <= e);
  }, [parsed, filterStart, filterEnd]);

  // Only count FACTURA rows for revenue (exclude NOTA DE CRÉDITO)
  const ventasData = useMemo(() => data.filter((r) =>
    !r.tipo.toUpperCase().includes("CR") && !r.tipo.toUpperCase().includes("CRÉDITO")
  ), [data]);

  // ── KPIs ──────────────────────────────────────────────────────────────────

  const kpis = useMemo(() => {
    const totalArs = ventasData.reduce((s, r) => s + r.montoArs, 0);
    const totalUsd = ventasData.reduce((s, r) => s + r.montoUsd, 0);
    const uniqueInvoices = new Set(ventasData.map((r) => r.nombre).filter(Boolean)).size;
    const uniqueClients = new Set(ventasData.map((r) => r.cliente).filter(Boolean)).size;
    const totalCantidad = ventasData.reduce((s, r) => s + r.cantidad, 0);
    const ticketPromArs = uniqueInvoices > 0 ? totalArs / uniqueInvoices : 0;
    const totalIva = ventasData.reduce((s, r) => s + r.ivaMonto, 0);
    return { totalArs, totalUsd, uniqueInvoices, uniqueClients, totalCantidad, ticketPromArs, totalIva };
  }, [ventasData]);

  // ── Ventas por mes ────────────────────────────────────────────────────────

  const ventasMes = useMemo(() => {
    const map = new Map<string, { ars: number; usd: number; facturas: number }>();
    ventasData.forEach((r) => {
      if (!r.fecha) return;
      const key = `${r.fecha.getFullYear()}-${String(r.fecha.getMonth() + 1).padStart(2, "0")}`;
      const prev = map.get(key) ?? { ars: 0, usd: 0, facturas: 0 };
      map.set(key, { ars: prev.ars + r.montoArs, usd: prev.usd + r.montoUsd, facturas: prev.facturas + 1 });
    });
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([mes, v]) => {
        const [y, m] = mes.split("-");
        const label = new Date(Number(y), Number(m) - 1).toLocaleDateString("es-AR", { month: "short", year: "2-digit" });
        return { mes: label, ...v };
      });
  }, [ventasData]);

  // ── Ventas por categoría ──────────────────────────────────────────────────

  const ventasCategoria = useMemo(() => {
    const map = new Map<string, number>();
    ventasData.forEach((r) => {
      const k = r.categoria || "Sin categoría";
      map.set(k, (map.get(k) ?? 0) + r.montoArs);
    });
    const total = Array.from(map.values()).reduce((a, b) => a + b, 0);
    return Array.from(map.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([cat, ars]) => ({ cat, ars, pct: total > 0 ? (ars / total) * 100 : 0 }));
  }, [ventasData]);

  // ── Ventas por vertical ───────────────────────────────────────────────────

  const ventasVertical = useMemo(() => {
    const map = new Map<string, number>();
    ventasData.forEach((r) => {
      const k = r.vertical || "Sin vertical";
      map.set(k, (map.get(k) ?? 0) + r.montoArs);
    });
    const total = Array.from(map.values()).reduce((a, b) => a + b, 0);
    return Array.from(map.entries())
      .sort(([, a], [, b]) => b - a)
      .map(([name, value]) => ({ name, value, pct: total > 0 ? (value / total) * 100 : 0 }));
  }, [ventasData]);

  // ── Ventas por forma de pago ──────────────────────────────────────────────

  const ventasFormaPago = useMemo(() => {
    const map = new Map<string, number>();
    ventasData.forEach((r) => {
      const k = r.formaPago || "Sin especificar";
      map.set(k, (map.get(k) ?? 0) + r.montoArs);
    });
    const total = Array.from(map.values()).reduce((a, b) => a + b, 0);
    return Array.from(map.entries())
      .sort(([, a], [, b]) => b - a)
      .map(([name, value]) => ({ name, value, pct: total > 0 ? (value / total) * 100 : 0 }));
  }, [ventasData]);

  // ── Top productos ─────────────────────────────────────────────────────────

  const topProductos = useMemo(() => {
    const map = new Map<string, { ars: number; cant: number }>();
    ventasData.forEach((r) => {
      const k = r.descripcion || r.articulo || "Sin descripción";
      const prev = map.get(k) ?? { ars: 0, cant: 0 };
      map.set(k, { ars: prev.ars + r.montoArs, cant: prev.cant + r.cantidad });
    });
    return Array.from(map.entries())
      .sort(([, a], [, b]) => b.ars - a.ars)
      .slice(0, 10)
      .map(([desc, v]) => ({
        desc: desc.length > 30 ? desc.slice(0, 28) + "…" : desc,
        ars: v.ars,
        cant: v.cant,
      }));
  }, [ventasData]);

  // ── Tipo comprobante ──────────────────────────────────────────────────────

  const tiposComprobante = useMemo(() => {
    const map = new Map<string, { count: number; ars: number }>();
    data.forEach((r) => {
      const k = r.tipo || "Sin tipo";
      const prev = map.get(k) ?? { count: 0, ars: 0 };
      map.set(k, { count: prev.count + 1, ars: prev.ars + r.montoArs });
    });
    return Array.from(map.entries())
      .sort(([, a], [, b]) => b.count - a.count)
      .map(([tipo, v]) => ({ tipo, ...v }));
  }, [data]);

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* Date filter */}
      {minDate && (
        <div
          className="flex items-center justify-between flex-wrap gap-3 p-4 rounded-xl border"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}
        >
          <DateFilter
            minDate={minDate}
            maxDate={maxDate}
            start={filterStart}
            end={filterEnd}
            onChange={(s, e) => { setFilterStart(s); setFilterEnd(e); }}
          />
          <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            {fmtN(ventasData.length)} líneas de venta
          </span>
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPICard
          label="Ventas ARS"
          value={fmtARS(kpis.totalArs)}
          sub={`IVA: ${fmtARS(kpis.totalIva)}`}
          icon={<DollarSign size={18} />}
          color="#01d280"
        />
        <KPICard
          label="Ventas USD"
          value={fmtUSD(kpis.totalUsd)}
          icon={<TrendingUp size={18} />}
          color="#3B82F6"
        />
        <KPICard
          label="Comprobantes"
          value={fmtN(kpis.uniqueInvoices)}
          sub="facturas únicas"
          icon={<ShoppingCart size={18} />}
          color="#F59E0B"
        />
        <KPICard
          label="Ticket Prom. ARS"
          value={fmtARS(kpis.ticketPromArs)}
          sub="por factura"
          icon={<CreditCard size={18} />}
          color="#8B5CF6"
        />
        <KPICard
          label="Clientes"
          value={fmtN(kpis.uniqueClients)}
          sub="únicos"
          icon={<Users size={18} />}
          color="#EC4899"
        />
        <KPICard
          label="Unidades"
          value={fmtN(kpis.totalCantidad)}
          sub="artículos vendidos"
          icon={<Package size={18} />}
          color="#06B6D4"
        />
      </div>

      {/* Tipos de comprobante pills */}
      {tiposComprobante.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tiposComprobante.map((t, i) => (
            <div
              key={t.tipo}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border"
              style={{ background: `${CHART_COLORS[i % CHART_COLORS.length]}18`, borderColor: `${CHART_COLORS[i % CHART_COLORS.length]}44`, color: CHART_COLORS[i % CHART_COLORS.length] }}
            >
              <span>{t.tipo}</span>
              <span className="font-bold">{fmtN(t.count)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Row 1: Evolución de ventas (full width) */}
      {ventasMes.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <BarChart2 size={15} style={{ color: "#01d280" }} />
              Evolución de Ventas por Mes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={ventasMes} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="ars" name="Ventas ARS" stroke="#01d280" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Row 2: Categoría + Vertical */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Ventas por categoría */}
        {ventasCategoria.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Ventas por Categoría (ARS)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={ventasCategoria} layout="vertical" margin={{ left: 8, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                  <XAxis type="number" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="cat" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} width={110} />
                  <Tooltip
                    formatter={(value: number) => [fmtARS(value), "Ventas ARS"]}
                    contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                  />
                  <Bar dataKey="ars" name="ARS" radius={[0, 4, 4, 0]}>
                    {ventasCategoria.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Ventas por vertical */}
        {ventasVertical.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Ventas por Vertical</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 items-center">
                <ResponsiveContainer width="55%" height={260}>
                  <PieChart>
                    <Pie
                      data={ventasVertical}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={2}
                    >
                      {ventasVertical.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2 min-w-0">
                  {ventasVertical.map((v, i) => (
                    <div key={v.name} className="flex items-center gap-2 text-xs">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                      <span className="truncate flex-1" style={{ color: "var(--foreground)" }}>{v.name}</span>
                      <span className="font-semibold shrink-0" style={{ color: "var(--muted-foreground)" }}>{v.pct.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Row 3: Forma de pago + Top productos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Forma de pago */}
        {ventasFormaPago.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Ventas por Forma de Pago</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {ventasFormaPago.map((fp, i) => (
                  <div key={fp.name}>
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color: "var(--foreground)" }}>{fp.name}</span>
                      <span style={{ color: "var(--muted-foreground)" }}>
                        {fmtARS(fp.value)} · {fp.pct.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--secondary)" }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${fp.pct}%`, background: CHART_COLORS[i % CHART_COLORS.length] }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top 10 productos */}
        {topProductos.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Top 10 Productos por Ventas ARS</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={topProductos} layout="vertical" margin={{ left: 8, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                  <XAxis type="number" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="desc" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} width={130} />
                  <Tooltip
                    formatter={(value: number) => [fmtARS(value), "Ventas ARS"]}
                    contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                  />
                  <Bar dataKey="ars" name="ARS" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Row 4: Ventas ARS vs USD por mes */}
      {ventasMes.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Transacciones por Mes</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={ventasMes} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                <Tooltip
                  formatter={(v: number) => [fmtN(v), "Comprobantes"]}
                  contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                />
                <Bar dataKey="facturas" name="Comprobantes" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

    </div>
  );
}
