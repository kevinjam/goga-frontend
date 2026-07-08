"use client";

import { UploadCloud, X } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

interface UploadDropZoneProps {
  file: File | null;
  disabled?: boolean;
  onFileAccepted: (file: File) => void;
  onClear: () => void;
}

const maxFileSize = 5 * 1024 * 1024;

export function UploadDropZone({
  file,
  disabled,
  onFileAccepted,
  onClear
}: UploadDropZoneProps) {
  const dropzone = useDropzone({
    multiple: false,
    maxSize: maxFileSize,
    disabled,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"]
    },
    onDropAccepted(files) {
      if (files[0]) {
        onFileAccepted(files[0]);
      }
    }
  });

  return (
    <div className="space-y-3">
      <div
        {...dropzone.getRootProps()}
        className={cn(
          "rounded-lg border-2 border-dashed p-6 text-center transition-colors sm:p-8",
          dropzone.isDragActive
            ? "border-primary bg-primary/5"
            : "border-border bg-card",
          disabled && "pointer-events-none opacity-60"
        )}
      >
        <input {...dropzone.getInputProps()} />
        <UploadCloud className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
        <p className="text-sm font-medium">
          {dropzone.isDragActive
            ? "Drop the spreadsheet here"
            : "Drag & drop your Excel file here"}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Tap to choose a file, or drag and drop on desktop. Supports .xlsx and .xls up to 5MB.
        </p>
      </div>

      {file ? (
        <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-muted/30 px-3 py-2 text-sm">
          <div className="min-w-0">
            <p className="truncate font-medium">{file.name}</p>
            <p className="text-xs text-muted-foreground">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          <Button type="button" variant="ghost" size="icon" className="h-10 w-10 shrink-0" onClick={onClear}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : null}

      {dropzone.fileRejections.length > 0 ? (
        <p className="text-sm text-danger">
          Invalid file. Upload a valid Excel file (.xlsx/.xls) below 5MB.
        </p>
      ) : null}
    </div>
  );
}
