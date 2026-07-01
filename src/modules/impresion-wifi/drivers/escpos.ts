/**
 * Driver ESC/POS — stub para implementación futura.
 *
 * Requiere conocer modelo de impresora (80mm, Wi-Fi/Ethernet, ESC/POS).
 * Próximo paso: conectar vía TCP al IP:9100 típico de impresoras de red.
 */
export interface EscPosPrintOptions {
  ip: string;
  port?: number;
  ticket: string;
  destino: string;
}

export async function printEscPos(
  _options: EscPosPrintOptions,
): Promise<{ ok: false; message: string }> {
  return {
    ok: false,
    message:
      "Driver ESC/POS no implementado todavía. Configure PRINT_MODE=mock o confirme modelo de impresora.",
  };
}
