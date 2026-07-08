import * as XLSX from "xlsx";
import type { ParsedPaymentRow, RowValidationError } from "@/types/payments-upload";

const requiredColumnGroups = [
  ["date"],
  ["received from"],
  ["amount"],
  ["method"],
  ["purpose", "for"]
] as const;

const optionalColumns = ["transaction reference", "reference", "ref"] as const;

function normalizeHeader(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;

  const raw = String(value ?? "").trim();
  if (!raw) return null;

  // Supports formats like: "UGX 1,200,000", "1,200,000.00 UGX", "UGX1,200,000"
  const numeric = raw
    .replace(/[^\d,.-]/g, "")
    .replace(/,/g, "");

  const parsed = Number(numeric);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatDate(value: unknown): string | null {
  if (typeof value === "number") {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (!parsed) return null;
    const date = new Date(Date.UTC(parsed.y, parsed.m - 1, parsed.d));
    return date.toISOString().slice(0, 10);
  }

  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

function getValue(
  row: Record<string, unknown>,
  index: Record<string, string>,
  key: string
): unknown {
  const matched = index[key];
  return matched ? row[matched] : undefined;
}

export async function parseExcelFile(file: File): Promise<{
  rows: ParsedPaymentRow[];
  errors: RowValidationError[];
  sheetName: string;
}> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const firstSheet = workbook.SheetNames[0];
  if (!firstSheet) {
    throw new Error("No worksheet found in this file.");
  }

  const worksheet = workbook.Sheets[firstSheet];
  const records = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
    defval: ""
  });

  if (records.length === 0) {
    throw new Error("The spreadsheet appears empty.");
  }

  const headers = Object.keys(records[0]);
  const index: Record<string, string> = {};
  for (const header of headers) {
    index[normalizeHeader(header)] = header;
  }

  for (const group of requiredColumnGroups) {
    const exists = group.some((col) => Boolean(index[col]));
    if (!exists) {
      throw new Error(`Missing required column: ${group.join(" or ")}`);
    }
  }

  const rows: ParsedPaymentRow[] = [];
  const errors: RowValidationError[] = [];
  const seenReferences = new Set<string>();

  records.forEach((row, idx) => {
    const rowNumber = idx + 2;
    const rowErrors: string[] = [];

    const date = formatDate(getValue(row, index, "date"));
    const receivedFrom = String(getValue(row, index, "received from") ?? "").trim();
    const amount = asNumber(getValue(row, index, "amount"));
    const method = String(getValue(row, index, "method") ?? "").trim();
    const purpose = String(
      getValue(row, index, "purpose") ?? getValue(row, index, "for") ?? ""
    ).trim();

    let transactionReference: string | null = null;
    for (const key of optionalColumns) {
      const candidate = String(getValue(row, index, key) ?? "").trim();
      if (candidate) {
        transactionReference = candidate;
        break;
      }
    }

    if (!date) rowErrors.push("Invalid date");
    if (!receivedFrom) rowErrors.push("Received From is required");
    if (!amount || amount <= 0) rowErrors.push("Amount must be a positive number");
    if (!method) rowErrors.push("Method is required");
    if (!purpose) rowErrors.push("Purpose is required");

    if (transactionReference) {
      const normalizedRef = transactionReference.toLowerCase();
      if (seenReferences.has(normalizedRef)) {
        rowErrors.push("Duplicate transaction reference in file");
      }
      seenReferences.add(normalizedRef);
    }

    const parsedRow: ParsedPaymentRow = {
      rowNumber,
      date: date ?? "",
      receivedFrom,
      amount: amount ?? 0,
      method,
      purpose,
      transactionReference,
      isValid: rowErrors.length === 0
    };

    rows.push(parsedRow);
    if (rowErrors.length > 0) {
      errors.push({ rowNumber, errors: rowErrors });
    }
  });

  return { rows, errors, sheetName: firstSheet };
}
