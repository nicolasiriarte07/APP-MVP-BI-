"use client";

import React, { useCallback, useRef, useState } from "react";
import { Upload, X, ChevronRight, ChevronLeft, Check, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isSupportedFile, parseFile, type ParsedFile } from "@/lib/file-parser";
import {
  detectAllColumns,
  confidenceLabel,
  confidenceColor,
  ALL_FIELDS,
  REQUIRED_FIELDS,
  FIELD_META,
  type ColumnMapping,
} from "@/lib/column-detection";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ImportDialogProps {
  open: boolean;
  onClose: () => void;
  /** Called with the mapped rows once the user confirms import. */
  onImport?: (rows: Record<string, string>[], mapping: ColumnMapping) => void;
}

type Step = "upload" | "map" | "preview";

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: Step }) {
  const steps: { id: Step; label: string }[] = [
    { id: "upload",  label: "Subir archivo" },
    { id: "map",     label: "Mapear columnas" },
    { id: "preview", label: "Vista previa" },
  ];
  const idx = steps.findIndex((s) => s.id === current);

  return (
    <div className="flex items-center gap-0 mb-8">
      {steps.map((step, i) => (
        <React.Fragment key={step.id}>
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors"
              style={{
                background: i <= idx ? "var(--primary-600)" : "var(--secondary-200)",
                color: i <= idx ? "#fff" : "var(--secondary-500)",
              }}
            >
              {i < idx ? <Check size={13} /> : i + 1}
            </div>
            <span
              className="text-sm font-medium"
              style={{ color: i <= idx ? "var(--primary-600)" : "var(--secondary-400)" }}
            >
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className="flex-1 h-px mx-3"
              style={{
                background: i < idx ? "var(--primary-600)" : "var(--secondary-200)",
              }}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── Step 1: Upload ───────────────────────────────────────────────────────────

function UploadStep({
  onFileParsed,
  error,
}: {
  onFileParsed: (parsed: ParsedFile) => void;
  error: string | null;
}) {
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handle = useCallback(
    async (file: File) => {
      if (!isSupportedFile(file)) {
        alert("Formato no soportado. Usa CSV, XLS, XLSX u ODS.");
        return;
      }
      setLoading(true);
      try {
        const parsed = await parseFile(file);
        onFileParsed(parsed);
      } catch {
        alert("No se pudo leer el archivo. Asegúrate de que no esté corrupto.");
      } finally {
        setLoading(false);
      }
    },
    [onFileParsed]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handle(file);
    },
    [handle]
  );

  return (
    <div className="flex flex-col items-center">
      <div
        className="w-full border-2 border-dashed rounded-[var(--radius-md)] flex flex-col items-center justify-center gap-4 cursor-pointer transition-all"
        style={{
          borderColor: dragging ? "var(--primary-600)" : "var(--secondary-300)",
          background: dragging ? "var(--primary-50)" : "var(--secondary-50)",
          padding: "48px 24px",
        }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
      >
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center"
          style={{ background: "var(--primary-100)" }}
        >
          <Upload size={24} style={{ color: "var(--primary-600)" }} />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold" style={{ color: "var(--secondary-800)" }}>
            Arrastra tu archivo aquí
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--secondary-500)" }}>
            o haz clic para seleccionar · CSV, XLS, XLSX, ODS
          </p>
        </div>
        {loading && (
          <p className="text-xs" style={{ color: "var(--primary-600)" }}>
            Procesando…
          </p>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.xls,.xlsx,.ods"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handle(f); }}
      />
      {error && (
        <p className="mt-3 text-xs" style={{ color: "var(--error)" }}>
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Step 2: Column mapper ────────────────────────────────────────────────────

function ConfidenceBadge({ confidence }: { confidence: number }) {
  if (confidence === 0) return null;
  return (
    <span
      className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
      style={{
        background: confidenceColor(confidence) + "22",
        color: confidenceColor(confidence),
        border: `1px solid ${confidenceColor(confidence)}44`,
      }}
    >
      {confidenceLabel(confidence)}
    </span>
  );
}

function MapStep({
  parsed,
  mapping,
  onChange,
}: {
  parsed: ParsedFile;
  mapping: ColumnMapping;
  onChange: (field: string, column: string | null) => void;
}) {
  const NONE = "__none__";

  return (
    <div>
      <p className="text-sm mb-5" style={{ color: "var(--secondary-500)" }}>
        Detectamos automáticamente las columnas. Puedes corregir cualquier
        asignación usando los desplegables.
      </p>

      <div className="flex flex-col gap-3">
        {ALL_FIELDS.map((field) => {
          const meta = FIELD_META[field];
          const match = mapping[field];
          const isRequired = meta.required;
          const isMissing = isRequired && !match?.column;

          return (
            <div
              key={field}
              className="flex items-center gap-4 rounded-[var(--radius-sm)] px-4 py-3"
              style={{
                background: isMissing
                  ? "#FEF2F2"
                  : "var(--secondary-50)",
                border: `1px solid ${isMissing ? "var(--error)" : "var(--secondary-200)"}`,
              }}
            >
              {/* Field label */}
              <div className="flex items-center gap-2 w-36 shrink-0">
                <span className="text-base">{meta.icon}</span>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium" style={{ color: "var(--secondary-800)" }}>
                      {meta.label}
                    </span>
                    {isRequired && (
                      <span className="text-xs" style={{ color: "var(--error)" }}>*</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <ChevronRight size={14} style={{ color: "var(--secondary-400)", flexShrink: 0 }} />

              {/* Column selector */}
              <div className="flex items-center gap-2 flex-1">
                <select
                  className="text-sm rounded-[var(--radius-sm)] border px-2 py-1.5 flex-1 outline-none focus:ring-2 focus:ring-[var(--primary-400)]"
                  style={{
                    borderColor: isMissing ? "var(--error)" : "var(--secondary-300)",
                    background: "#fff",
                    color: "var(--secondary-800)",
                  }}
                  value={match?.column ?? NONE}
                  onChange={(e) =>
                    onChange(field, e.target.value === NONE ? null : e.target.value)
                  }
                >
                  <option value={NONE}>— Sin asignar —</option>
                  {parsed.headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>

                <ConfidenceBadge confidence={match?.confidence ?? 0} />
              </div>

              {isMissing && (
                <span className="text-[10px] font-medium" style={{ color: "var(--error)" }}>
                  Requerido
                </span>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-xs mt-4" style={{ color: "var(--secondary-400)" }}>
        * Campos obligatorios
      </p>
    </div>
  );
}

// ─── Step 3: Preview ──────────────────────────────────────────────────────────

function PreviewStep({
  parsed,
  mapping,
}: {
  parsed: ParsedFile;
  mapping: ColumnMapping;
}) {
  const assignedFields = ALL_FIELDS.filter((f) => mapping[f]?.column);
  const previewRows = parsed.rows.slice(0, 5);

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-sm)]"
          style={{ background: "var(--primary-50)", border: "1px solid var(--primary-200)" }}
        >
          <FileText size={14} style={{ color: "var(--primary-600)" }} />
          <span className="text-sm font-medium" style={{ color: "var(--primary-700)" }}>
            {parsed.fileName}
          </span>
        </div>
        <span className="text-sm" style={{ color: "var(--secondary-500)" }}>
          {parsed.totalRows.toLocaleString()} filas · mostrando primeras {previewRows.length}
        </span>
      </div>

      <div className="overflow-x-auto rounded-[var(--radius-sm)] border" style={{ borderColor: "var(--secondary-200)" }}>
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr style={{ background: "var(--secondary-50)" }}>
              {assignedFields.map((field) => (
                <th
                  key={field}
                  className="px-3 py-2 font-semibold text-xs uppercase tracking-wide whitespace-nowrap"
                  style={{
                    color: "var(--secondary-500)",
                    borderBottom: "1px solid var(--secondary-200)",
                  }}
                >
                  {FIELD_META[field].icon} {FIELD_META[field].label}
                  <span
                    className="block text-[10px] font-normal normal-case tracking-normal mt-0.5"
                    style={{ color: "var(--secondary-400)" }}
                  >
                    {mapping[field].column}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {previewRows.map((row, i) => (
              <tr key={i} style={{ borderBottom: "1px solid var(--secondary-100)" }}>
                {assignedFields.map((field) => {
                  const col = mapping[field].column!;
                  return (
                    <td
                      key={field}
                      className="px-3 py-2 text-xs"
                      style={{ color: "var(--secondary-700)", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                    >
                      {row[col] || <span style={{ color: "var(--secondary-300)" }}>—</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Main dialog ──────────────────────────────────────────────────────────────

export function ImportDialog({ open, onClose, onImport }: ImportDialogProps) {
  const [step, setStep] = useState<Step>("upload");
  const [parsed, setParsed] = useState<ParsedFile | null>(null);
  const [mapping, setMapping] = useState<ColumnMapping>({});
  const [parseError, setParseError] = useState<string | null>(null);

  const reset = () => {
    setStep("upload");
    setParsed(null);
    setMapping({});
    setParseError(null);
  };

  const handleClose = () => { reset(); onClose(); };

  const handleFileParsed = (file: ParsedFile) => {
    setParseError(null);
    setParsed(file);
    setMapping(detectAllColumns(file.headers, ALL_FIELDS));
    setStep("map");
  };

  const handleMappingChange = (field: string, column: string | null) => {
    setMapping((prev) => ({
      ...prev,
      [field]: { column, confidence: column ? 100 : 0, matchType: column ? "exact" : "none" },
    }));
  };

  const missingRequired = REQUIRED_FIELDS.filter((f) => !mapping[f]?.column);
  const canProceedToPreview = missingRequired.length === 0;

  const handleImport = () => {
    if (!parsed) return;
    onImport?.(parsed.rows, mapping);
    handleClose();
  };

  if (!open) return null;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(17,24,39,0.45)", backdropFilter: "blur(2px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      {/* Panel */}
      <div
        className="relative w-full max-w-2xl rounded-[var(--radius-lg)] shadow-xl flex flex-col"
        style={{ background: "var(--bg-surface)", maxHeight: "90vh" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 pt-6 pb-4"
          style={{ borderBottom: "1px solid var(--secondary-200)" }}
        >
          <div>
            <h2 className="text-lg font-bold" style={{ color: "var(--secondary-900)" }}>
              Importar datos
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--secondary-500)" }}>
              CSV, Excel o ODS · Detección automática de columnas
            </p>
          </div>
          <button
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{ color: "var(--secondary-400)" }}
            onClick={handleClose}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 overflow-y-auto flex-1">
          <StepIndicator current={step} />

          {step === "upload" && (
            <UploadStep onFileParsed={handleFileParsed} error={parseError} />
          )}

          {step === "map" && parsed && (
            <MapStep parsed={parsed} mapping={mapping} onChange={handleMappingChange} />
          )}

          {step === "preview" && parsed && (
            <PreviewStep parsed={parsed} mapping={mapping} />
          )}
        </div>

        {/* Footer */}
        {step !== "upload" && (
          <div
            className="flex items-center justify-between px-6 py-4"
            style={{ borderTop: "1px solid var(--secondary-200)" }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep(step === "preview" ? "map" : "upload")}
            >
              <ChevronLeft size={14} />
              Atrás
            </Button>

            <div className="flex items-center gap-3">
              {!canProceedToPreview && step === "map" && (
                <span className="text-xs" style={{ color: "var(--error)" }}>
                  Asigna los campos obligatorios (*) para continuar
                </span>
              )}

              {step === "map" && (
                <Button
                  variant="primary"
                  size="sm"
                  disabled={!canProceedToPreview}
                  onClick={() => setStep("preview")}
                >
                  Vista previa
                  <ChevronRight size={14} />
                </Button>
              )}

              {step === "preview" && (
                <Button variant="primary" size="sm" onClick={handleImport}>
                  <Check size={14} />
                  Confirmar importación
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
