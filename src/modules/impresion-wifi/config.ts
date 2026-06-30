import type { PrintMode } from "@/modules/impresion-wifi/types";

export function getPrintMode(): PrintMode {
  const mode = process.env.NEXT_PUBLIC_PRINT_MODE ?? process.env.PRINT_MODE ?? "mock";
  return mode === "network" ? "network" : "mock";
}

export function getPrintServerUrl(): string | null {
  const url =
    process.env.NEXT_PUBLIC_PRINT_SERVER_URL ??
    process.env.PRINT_SERVER_URL ??
    null;
  return url?.trim() || null;
}

export function getPrinterIp(destino: "cocina" | "barra" | "postres"): string | null {
  const map = {
    cocina: process.env.PRINTER_COCINA_IP,
    barra: process.env.PRINTER_BARRA_IP,
    postres: process.env.PRINTER_POSTRES_IP,
  };
  return map[destino]?.trim() || null;
}
