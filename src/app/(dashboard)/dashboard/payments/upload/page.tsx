"use client";

import { useMemo, useState } from "react";
import { Loader2, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Progress
} from "@/components/ui";
import { UploadDropZone } from "@/features/payments-upload/components/upload-drop-zone";
import { PreviewTable } from "@/features/payments-upload/components/preview-table";
import { ImportSummary } from "@/features/payments-upload/components/import-summary";
import { parseExcelFile } from "@/features/payments-upload/utils/parseExcel";
import { paymentsUploadService } from "@/services/api/paymentsUploadService";
import type {
  ImportPaymentsResponse,
  ParsedPaymentRow,
  RowValidationError
} from "@/types/payments-upload";

export default function UploadPaymentsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<ParsedPaymentRow[]>([]);
  const [sheetName, setSheetName] = useState<string | undefined>();
  const [validationErrors, setValidationErrors] = useState<RowValidationError[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [summary, setSummary] = useState<ImportPaymentsResponse | null>(null);

  const validRows = useMemo(() => rows.filter((r) => r.isValid), [rows]);

  async function handleFileAccepted(nextFile: File) {
    setFile(nextFile);
    setSummary(null);
    setRows([]);
    setValidationErrors([]);
    setParseError(null);
    setSheetName(undefined);
    setIsParsing(true);

    try {
      const parsed = await parseExcelFile(nextFile);
      setRows(parsed.rows);
      setValidationErrors(parsed.errors);
      setSheetName(parsed.sheetName);
      toast.success("Spreadsheet parsed successfully");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to parse spreadsheet";
      setParseError(message);
      toast.error(message);
    } finally {
      setIsParsing(false);
    }
  }

  function resetUpload() {
    setFile(null);
    setRows([]);
    setSummary(null);
    setSheetName(undefined);
    setValidationErrors([]);
    setParseError(null);
    setIsParsing(false);
    setIsSubmitting(false);
  }

  async function submitUpload() {
    if (!file || validRows.length === 0) return;

    setIsSubmitting(true);
    try {
      const result = await paymentsUploadService.importPayments({
        fileName: file.name,
        sheetName,
        rows: validRows
      });
      setSummary(result);
      toast.success("Payments imported successfully");
    } catch {
      toast.error("Import failed. Please review the file and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (summary) {
    return <ImportSummary data={summary} onUploadAnother={resetUpload} />;
  }

  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight md:text-2xl">Upload Payments</h1>
        <p className="text-sm text-muted-foreground">
          Drop a payment spreadsheet, preview records, and bulk import to the
          system.
        </p>
        <a href="#" className="text-sm text-primary hover:underline">
          Download Template Spreadsheet
        </a>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Spreadsheet Upload</CardTitle>
          <CardDescription>
            Required columns: Date, Received From, Amount, Method, Purpose.
            Transaction Reference is optional.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <UploadDropZone
            file={file}
            disabled={isParsing || isSubmitting}
            onFileAccepted={handleFileAccepted}
            onClear={resetUpload}
          />

          {isParsing ? (
            <div className="space-y-2 rounded-md border border-border p-3">
              <div className="flex items-center gap-2 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                Parsing spreadsheet...
              </div>
              <Progress value={60} />
            </div>
          ) : null}

          {parseError ? (
            <Alert className="border-danger/40 bg-danger/5">
              <AlertTitle>Invalid spreadsheet format</AlertTitle>
              <AlertDescription>{parseError}</AlertDescription>
            </Alert>
          ) : null}

          {rows.length > 0 ? (
            <Alert>
              <AlertTitle>Preview ready</AlertTitle>
              <AlertDescription>
                Parsed {rows.length} rows ({validRows.length} valid /{" "}
                {validationErrors.length} invalid).
              </AlertDescription>
            </Alert>
          ) : null}

          {rows.length > 0 ? <PreviewTable rows={rows} /> : null}

          {validationErrors.length > 0 ? (
            <Alert className="border-warning/40 bg-warning/5">
              <AlertTitle>Validation issues found</AlertTitle>
              <AlertDescription>
                <div className="mt-2 max-h-40 overflow-auto">
                  {validationErrors.slice(0, 10).map((err) => (
                    <p key={err.rowNumber}>
                      Row {err.rowNumber}: {err.errors.join(", ")}
                    </p>
                  ))}
                  {validationErrors.length > 10 ? (
                    <p className="mt-1 text-xs">
                      ...and {validationErrors.length - 10} more rows.
                    </p>
                  ) : null}
                </div>
              </AlertDescription>
            </Alert>
          ) : null}

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <Button
              className="min-h-10 w-full sm:w-auto"
              onClick={submitUpload}
              disabled={
                isSubmitting || isParsing || !file || validRows.length === 0
              }
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Submit Upload
                </>
              )}
            </Button>
            <Button
              variant="outline"
              className="min-h-10 w-full sm:w-auto"
              onClick={resetUpload}
              disabled={isSubmitting}
            >
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
