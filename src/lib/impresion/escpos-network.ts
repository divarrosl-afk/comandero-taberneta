import net from "node:net";
import {
  buildTestTicketBuffer,
  buildTicketBuffer,
  encodePlainTicket,
} from "@/lib/impresion/escpos-encode";
import { CMD_INIT, cutPaper, openDrawer } from "@/lib/impresion/escpos-commands";
import type { AnchoPapel } from "@/types/impresora";

export { cutPaper, openDrawer };

const TCP_TIMEOUT_MS = 3000;

export interface TcpPrintResult {
  success: boolean;
  error?: string;
}

function friendlySocketError(err: NodeJS.ErrnoException): string {
  switch (err.code) {
    case "ECONNREFUSED":
      return "Impresora rechazó la conexión (¿apagada o IP incorrecta?)";
    case "ETIMEDOUT":
      return "Timeout de conexión con la impresora";
    case "ENETUNREACH":
      return "Red inalcanzable — compruebe WiFi y subred";
    case "EHOSTUNREACH":
      return "No se alcanza la impresora en esa IP";
    case "ECONNRESET":
      return "La impresora cerró la conexión";
    default:
      return err.message || "Error de conexión TCP";
  }
}

function tcpSendBuffer(
  ip: string,
  port: number,
  buffer: Buffer,
  timeoutMs = TCP_TIMEOUT_MS,
): Promise<TcpPrintResult> {
  return new Promise((resolve) => {
    let connected = false;
    let finished = false;

    const finish = (result: TcpPrintResult) => {
      if (finished) return;
      finished = true;
      resolve(result);
    };

    const socket = net.createConnection({ host: ip, port }, () => {
      connected = true;
      socket.write(buffer, (writeErr) => {
        if (writeErr) {
          socket.destroy();
          finish({
            success: false,
            error: friendlySocketError(writeErr as NodeJS.ErrnoException),
          });
          return;
        }
        socket.end();
      });
    });

    socket.setTimeout(timeoutMs);
    socket.on("timeout", () => {
      socket.destroy();
      finish({
        success: false,
        error: `Timeout (${timeoutMs}ms) al conectar con ${ip}:${port}`,
      });
    });
    socket.on("error", (err) => {
      if (!connected || !finished) {
        finish({
          success: false,
          error: friendlySocketError(err as NodeJS.ErrnoException),
        });
      }
    });
    socket.on("close", () => {
      if (connected && !finished) {
        finish({ success: true });
      }
    });
  });
}

/** Envía buffer ESC/POS por TCP con un reintento. */
export async function printTicket(
  ip: string,
  port: number,
  buffer: Buffer,
): Promise<TcpPrintResult> {
  const host = ip.trim();
  if (!host) {
    return { success: false, error: "IP de impresora no configurada" };
  }

  const safePort = port > 0 ? port : 9100;
  const first = await tcpSendBuffer(host, safePort, buffer);
  if (first.success) return first;

  const second = await tcpSendBuffer(host, safePort, buffer);
  return second;
}

/** Imprime texto plano como ticket ESC/POS. */
export async function printTicketText(
  ip: string,
  port: number,
  text: string,
  anchoPapel: AnchoPapel = "80mm",
  formatted = true,
): Promise<TcpPrintResult> {
  const buffer = formatted
    ? buildTicketBuffer(text, anchoPapel)
    : encodePlainTicket(text, anchoPapel);
  return printTicket(ip, port, buffer);
}

/** Solo comprueba socket (ESC @), sin imprimir ticket completo. */
export async function probePrinter(
  ip: string,
  port: number,
): Promise<TcpPrintResult> {
  return printTicket(ip, port, CMD_INIT);
}

/** Prueba real: ticket TEST + corte (timeout 3s). */
export async function testPrinter(
  ip: string,
  port: number,
): Promise<TcpPrintResult> {
  const buffer = buildTestTicketBuffer();
  return printTicket(ip, port, buffer);
}
