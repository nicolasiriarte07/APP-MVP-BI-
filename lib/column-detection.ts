/** Maps semantic field types to all recognized column name variants (ES + EN). */
const COLUMN_ALIASES: Record<string, string[]> = {
  email: [
    "email", "correo", "e-mail", "mail", "customer_email", "email_address",
    "correo_electronico", "emailaddress", "email_cliente", "client_email",
    "user_email", "emailcliente", "correoelectronico",
  ],
  date: [
    "created_at", "fecha", "date", "order_date", "fecha_creacion", "created",
    "timestamp", "datetime", "creation_date", "fecha_orden", "fecha_pedido",
    "purchase_date", "fecha_compra", "transaction_date", "fechacreacion",
    "fechaorden", "fechapedido",
  ],
  amount: [
    "total", "amount", "precio", "subtotal", "monto", "valor", "price",
    "importe", "sum", "total_amount", "grand_total", "venta", "revenue",
    "ingreso", "costo", "cost", "totalamount",
  ],
  name: [
    "nombre", "name", "customer_name", "full_name", "nombre_completo",
    "cliente", "customer", "nombrecliente", "nombre_cliente", "client_name",
    "user_name", "username", "fullname", "nombrecompleto",
  ],
  id: [
    "id", "order_id", "pedido_id", "customer_id", "numero", "number",
    "folio", "order_number", "numero_pedido", "transaction_id", "orderid",
    "customerid", "numeropedido",
  ],
  phone: [
    "phone", "telefono", "tel", "celular", "mobile", "phone_number",
    "numero_telefono", "movil", "phonenumber", "numeritelefono",
  ],
  status: [
    "status", "estado", "state", "estatus", "condition", "situacion",
  ],
  category: [
    "category", "categoria", "type", "tipo", "group", "grupo", "clase",
  ],
};

export interface ColumnMatch {
  column: string | null;
  confidence: number; // 0–100
  matchType: "exact" | "contains" | "fuzzy" | "none";
}

export interface ColumnMapping {
  [fieldType: string]: ColumnMatch;
}

export interface FieldMeta {
  label: string;
  icon: string;
  required: boolean;
}

export const FIELD_META: Record<string, FieldMeta> = {
  email:    { label: "Email",      icon: "📧", required: true  },
  date:     { label: "Fecha",      icon: "📅", required: true  },
  amount:   { label: "Monto",      icon: "💰", required: true  },
  name:     { label: "Nombre",     icon: "👤", required: false },
  id:       { label: "ID / Folio", icon: "🔢", required: false },
  phone:    { label: "Teléfono",   icon: "📞", required: false },
  status:   { label: "Estado",     icon: "🏷️",  required: false },
  category: { label: "Categoría",  icon: "📂", required: false },
};

export const ALL_FIELDS = Object.keys(FIELD_META);
export const REQUIRED_FIELDS = ALL_FIELDS.filter((f) => FIELD_META[f].required);

/** Strips accents, spaces, dashes and underscores, lowercases. */
function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s\-_.]/g, "");
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

/** Finds the best matching header for a given semantic field type. */
export function detectColumn(
  headers: string[],
  fieldType: string
): ColumnMatch {
  const aliases = COLUMN_ALIASES[fieldType] ?? [fieldType];
  let best: ColumnMatch = { column: null, confidence: 0, matchType: "none" };

  for (const header of headers) {
    const normH = normalize(header);

    for (const alias of aliases) {
      const normA = normalize(alias);

      // Exact match
      if (normH === normA) {
        return { column: header, confidence: 100, matchType: "exact" };
      }

      // Contains match (one string contains the other)
      if (normH.includes(normA) || normA.includes(normH)) {
        const confidence = 80;
        if (confidence > best.confidence) {
          best = { column: header, confidence, matchType: "contains" };
        }
        continue;
      }

      // Fuzzy (Levenshtein ≤ 2) — only meaningful for strings long enough
      if (normH.length >= 4 && normA.length >= 4) {
        const dist = levenshtein(normH, normA);
        if (dist <= 2) {
          const confidence = Math.round(
            (1 - dist / Math.max(normH.length, normA.length)) * 60
          );
          if (confidence > best.confidence) {
            best = { column: header, confidence, matchType: "fuzzy" };
          }
        }
      }
    }
  }

  return best;
}

/**
 * Runs detection across all requested fields, avoiding double-assigning
 * the same source column to two fields (highest-confidence wins).
 */
export function detectAllColumns(
  headers: string[],
  fields: string[] = ALL_FIELDS
): ColumnMapping {
  // Collect raw candidates
  const candidates: Array<{
    field: string;
    match: ColumnMatch;
  }> = fields.map((field) => ({
    field,
    match: detectColumn(headers, field),
  }));

  // Resolve conflicts: if two fields compete for the same column, the one
  // with higher confidence wins; the other falls back to "none".
  const usedColumns = new Set<string>();
  const mapping: ColumnMapping = {};

  // Sort by confidence descending so higher-confidence claims are granted first
  candidates
    .sort((a, b) => b.match.confidence - a.match.confidence)
    .forEach(({ field, match }) => {
      if (match.column && usedColumns.has(match.column)) {
        mapping[field] = { column: null, confidence: 0, matchType: "none" };
      } else {
        mapping[field] = match;
        if (match.column) usedColumns.add(match.column);
      }
    });

  return mapping;
}

/** Returns a human-readable confidence label. */
export function confidenceLabel(confidence: number): string {
  if (confidence === 100) return "Exacto";
  if (confidence >= 80) return "Alto";
  if (confidence >= 60) return "Medio";
  if (confidence > 0) return "Bajo";
  return "Sin detectar";
}

/** Returns a CSS color token for the confidence level. */
export function confidenceColor(confidence: number): string {
  if (confidence === 100) return "var(--success)";
  if (confidence >= 80) return "var(--info)";
  if (confidence >= 60) return "var(--warning)";
  return "var(--error)";
}
