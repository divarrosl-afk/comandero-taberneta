"use client";

import type { PrintJobStatus } from "@/modules/impresion-wifi/types";
import { printStatusLabel } from "@/modules/impresion-wifi/print-ticket";

interface PrintStatusBannerProps {
  summary: string | null;
  loading?: boolean;
  error?: boolean;
  /** Estado del trabajo en print-server */
  status?: PrintJobStatus;
}

export function PrintStatusBanner({
  summary,
  loading = false,
  error = false,
  status,
}: PrintStatusBannerProps) {
  if (!summary && !loading && !status) return null;

  const isPrinting =
    loading || status === "printing" || status === "queued";
  const isError = error || status === "error";
  const isOk = !isPrinting && !isError && (status === "printed" || summary);

  const className = isPrinting
    ? "border-amber-200 bg-amber-50 text-amber-900"
    : isError
      ? "border-red-200 bg-red-50 text-red-800"
      : "border-green-200 bg-green-50 text-green-800";

  const label = isPrinting
    ? status
      ? printStatusLabel(status)
      : "Enviando a impresora..."
    : summary;

  return (
    <div
      className={`mb-4 rounded-xl border px-4 py-3 text-sm font-medium ${className}`}
    >
      {label}
      {isOk && status === "printed" && summary && summary !== label && (
        <span className="mt-1 block text-xs opacity-80">{summary}</span>
      )}
    </div>
  );
}
