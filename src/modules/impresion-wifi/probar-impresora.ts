import { printTicket } from "@/modules/impresion-wifi/print-ticket";
import {
  getPrintServerUrl,
  resolveImpresoraConfig,
} from "@/modules/impresion-wifi/config";
import { PRINT_MESSAGES } from "@/modules/impresion-wifi/types";
import { TEST_IMPRESORA_TEXTO, type ImpresoraConfig } from "@/types/impresora";

export async function probarConexionImpresora(
  impresora?: ImpresoraConfig,
) {
  const config = impresora ?? resolveImpresoraConfig();
  const serverUrl = getPrintServerUrl();

  if (!serverUrl) {
    if (!config.ip?.trim()) {
      return {
        ok: false,
        message: PRINT_MESSAGES.impresoraNoConfigurada,
        timestamp: new Date().toISOString(),
      };
    }
    return {
      ok: false,
      message: PRINT_MESSAGES.sinPrintServer,
      timestamp: new Date().toISOString(),
    };
  }

  try {
    const response = await fetch(
      `${serverUrl.replace(/\/$/, "")}/test-connection`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ impresora: config }),
      },
    );
    return (await response.json()) as {
      ok: boolean;
      message: string;
      timestamp?: string;
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Error de conexión";
    return {
      ok: false,
      message: `No se alcanza el servidor de impresión: ${msg}`,
      timestamp: new Date().toISOString(),
    };
  }
}

export async function probarImpresora() {
  return printTicket(TEST_IMPRESORA_TEXTO, "cocina", {
    tipo: "reimpresion",
  });
}
