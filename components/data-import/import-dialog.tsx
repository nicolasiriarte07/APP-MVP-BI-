"use client";

import React, { useCallback, useRef, useState } from "react";
import { Upload, X, FileText } from "lucide-react";
import { isSupportedFile, parseFile } from "@/lib/file-parser";

interface ImportDialogProps {
  open: boolean;
  onClose: () => void;
  onImport?: (rows: Record<string, string>[]) => void;
}

export function ImportDialog({ open, onClose, onImport }: ImportDialogProps) {
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const PINK = "#E91E8C";

  const handle = useCallback(
    async (file: File) => {
      if (!isSupportedFile(file)) {
        setError("Formato no soportado. Usá CSV, XLS, XLSX u ODS.");
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const parsed = await parseFile(file);
        onImport?.(parsed.rows);
        onClose();
      } catch {
        setError("No se pudo leer el archivo. Asegurate de que no esté corrupto.");
      } finally {
        setLoading(false);
      }
    },
    [onImport, onClose]
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

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(17,24,39,0.45)", backdropFilter: "blur(2px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-md rounded-2xl shadow-xl"
        style={{ background: "#fff" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b" style={{ borderColor: "#F0F0F0" }}>
          <div>
            <h2 className="text-base font-bold" style={{ color: "#0F1419" }}>Importar CSV</h2>
            <p className="text-xs mt-0.5" style={{ color: "#94A3B8" }}>CSV, Excel o ODS</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors"
            style={{ color: "#94A3B8" }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Drop zone */}
        <div className="p-6">
          <div
            className="border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-4 cursor-pointer transition-all"
            style={{
              borderColor: dragging ? PINK : "#E2E8F0",
              background: dragging ? "#FCE4EC" : "#F8FAFC",
              padding: "48px 24px",
            }}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: "#FCE4EC" }}
            >
              {loading
                ? <div className="w-6 h-6 border-2 border-pink-300 border-t-pink-600 rounded-full animate-spin" />
                : <FileText size={24} style={{ color: PINK }} />
              }
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold" style={{ color: "#0F1419" }}>
                {loading ? "Procesando…" : "Arrastrá tu archivo aquí"}
              </p>
              <p className="text-xs mt-1" style={{ color: "#94A3B8" }}>
                o hacé clic para seleccionar · CSV, XLS, XLSX, ODS
              </p>
            </div>
          </div>

          {error && (
            <p className="mt-3 text-xs text-center" style={{ color: "#EF4444" }}>{error}</p>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xls,.xlsx,.ods"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handle(f); }}
        />
      </div>
    </div>
  );
}
