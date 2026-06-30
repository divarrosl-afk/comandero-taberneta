import type { ImpresoraConfig } from "@/types/impresora";

/**
 * Driver ESC/POS — stub para impresora principal única.
 * Próximo paso: TCP a ip:puerto (típico 9100).
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

  return {
    ok: false,
    message: `ESC/POS pendiente (${impresora.nombre} @ ${impresora.ip}:${impresora.puerto}). Usa modo mock mientras tanto.`,
  };
}
