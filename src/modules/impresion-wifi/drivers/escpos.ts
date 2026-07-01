import type { ImpresoraConfig } from "@/types/impresora";

/**
 * En producción (Vercel) no hay TCP a la LAN.
 * La impresión real la hace print-server en el portátil del restaurante.
 */
export interface EscPosPrintOptions {
  impresora: ImpresoraConfig;
  ticket: string;
  destino: string;
}

export async function printEscPos(
  options: EscPosPrintOptions,
): Promise<{ ok: false; message: string }> {
  const { impresora } = options;

  if (!impresora.ip) {
    return {
      ok: false,
      message: "Configure la IP de la impresora principal",
    };
  }

  const serverUrl =
    process.env.PRINT_SERVER_URL?.trim() ||
    process.env.NEXT_PUBLIC_PRINT_SERVER_URL?.trim();

  if (!serverUrl) {
    return {
      ok: false,
      message:
        "Impresión TCP solo disponible vía print-server local. Configure PRINT_SERVER_URL en el portátil del restaurante.",
    };
  }

  return {
    ok: false,
    message: `No se pudo alcanzar el print-server (${serverUrl}). Compruebe que está en marcha.`,
  };
}
