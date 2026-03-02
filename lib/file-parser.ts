import * as XLSX from "xlsx";

export interface ParsedFile {
  headers: string[];
  rows: Record<string, string>[];
  totalRows: number;
  fileName: string;
  sheetName: string;
}

const SUPPORTED_EXTENSIONS = [".csv", ".xls", ".xlsx", ".ods"];

export function isSupportedFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return SUPPORTED_EXTENSIONS.some((ext) => name.endsWith(ext));
}

export async function parseFile(file: File): Promise<ParsedFile> {
  const arrayBuffer = await file.arrayBuffer();

  const workbook = XLSX.read(arrayBuffer, {
    type: "array",
    cellDates: true,
    cellNF: false,
    cellText: false,
  });

  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
    raw: false,
    dateNF: "yyyy-mm-dd",
  });

  const headers = raw.length > 0 ? Object.keys(raw[0]) : [];

  const rows: Record<string, string>[] = raw.map((row) =>
    Object.fromEntries(
      Object.entries(row).map(([k, v]) => [k, v == null ? "" : String(v)])
    )
  );

  return { headers, rows, totalRows: rows.length, fileName: file.name, sheetName };
}
