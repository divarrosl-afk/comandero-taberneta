import type { PrintMode } from "@/modules/impresion-wifi/types";
import type { ImpresoraConfig } from "@/types/impresora";
import { IMPRESORA_DEFAULT } from "@/types/impresora";
import { getImpresoraConfig } from "@/lib/storage/impresora-config";

export function getPrintServerUrl(): string | null {
  const url =
    process.env.NEXT_PUBLIC_PRINT_SERVER_URL ??
    process.env.PRINT_SERVER_URL ??
    null;
  return url?.trim() || null;
}

/** Lee configuración de impresora: localStorage (cliente) o env (servidor) */
export function resolveImpresoraConfig(
  override?: ImpresoraConfig,
): ImpresoraConfig {
  if (override) return override;

  if (typeof window !== "undefined") {
    return getImpresoraConfig();
  }

  const ip = process.env.PRINTER_IP?.trim() ?? "";
  const modo = process.env.PRINT_MODE === "network" ? "network" : "mock";

  return {
    ...IMPRESORA_DEFAULT,
    ip,
    puerto: Number(process.env.PRINTER_PORT ?? 9100),
    modo,
  };
}

export function getEffectivePrintMode(
  impresora: ImpresoraConfig,
): PrintMode {
  if (!impresora.activa) return "mock";
  return impresora.modo === "network" ? "network" : "mock";
}
