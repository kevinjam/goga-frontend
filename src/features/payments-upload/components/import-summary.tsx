"use client";

import Link from "next/link";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui";
import type { ImportPaymentsResponse } from "@/types/payments-upload";

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardHeader className="pb-1">
        <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}

export function ImportSummary({
  data,
  onUploadAnother
}: {
  data: ImportPaymentsResponse;
  onUploadAnother: () => void;
}) {
  const failedRows = data.results.filter((item) => item.errors?.length);

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Import Summary</h2>
        <p className="text-sm text-muted-foreground">
          File: {data.fileName} • Upload ID: {data.uploadHistoryId}
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total Records Sent" value={data.summary.totalRows} />
        <MetricCard label="Successfully Created" value={data.summary.imported} />
        <MetricCard label="Skipped / Duplicates" value={data.summary.duplicates} />
        <MetricCard label="Failed Records" value={data.summary.failed + data.summary.invalid} />
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <MetricCard label="Receipts Generated" value={data.summary.receiptsGenerated} />
        <MetricCard label="Emails Sent" value={data.summary.emailsSent} />
        <MetricCard label="Email Failures" value={data.summary.emailFailures} />
      </div>

      {failedRows.length > 0 ? (
        <Alert className="border-danger/40 bg-danger/5">
          <AlertTitle>Some rows could not be processed</AlertTitle>
          <AlertDescription>
            <div className="mt-2 max-h-56 space-y-2 overflow-auto">
              {failedRows.map((row) => (
                <div key={row.rowNumber} className="rounded-md border border-border p-2">
                  <p className="font-medium">Row {row.rowNumber}</p>
                  <ul className="list-disc pl-5">
                    {(row.errors ?? []).map((error, idx) => (
                      <li key={idx}>{error}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button onClick={onUploadAnother}>Upload Another File</Button>
        <Link href="/dashboard/payments">
          <Button variant="outline">View Payments List</Button>
        </Link>
      </div>
    </section>
  );
}
