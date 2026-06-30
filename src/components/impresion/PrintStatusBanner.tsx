"use client";

interface PrintStatusBannerProps {
  summary: string | null;
  loading?: boolean;
  error?: boolean;
}

export function PrintStatusBanner({
  summary,
  loading = false,
  error = false,
}: PrintStatusBannerProps) {
  if (!summary && !loading) return null;

  const className = loading
    ? "border-amber-200 bg-amber-50 text-amber-900"
    : error
      ? "border-red-200 bg-red-50 text-red-800"
      : "border-green-200 bg-green-50 text-green-800";

  return (
    <div
      className={`mb-4 rounded-xl border px-4 py-3 text-sm font-medium ${className}`}
    >
      {loading ? "Enviando a impresora..." : summary}
    </div>
  );
}
