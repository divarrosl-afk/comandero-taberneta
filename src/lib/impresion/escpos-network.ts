import net from "node:net";
import {
  buildAdvancedTestTicketBuffer,
  buildTestTicketBuffer,
  buildTicketBuffer,
  encodePlainTicket,
} from "@/lib/impresion/escpos-encode";
import { writeEscPosDebugLog } from "@/lib/impresion/escpos-debug";
import { CMD_INIT, cutPaper, openDrawer } from "@/lib/impresion/escpos-commands";
import type { AnchoPapel } from "@/types/impresora";

export { cutPaper, openDrawer };

const TCP_CONNECT_TIMEOUT_MS = 4000;
const TCP_PRINT_TIMEOUT_MS = 20_000;
const TCP_CHUNK_SIZE = 1024;

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

/** Escribe el buffer completo respetando backpressure (drain) antes de cerrar. */
function writeBufferToSocket(socket: net.Socket, buffer: Buffer): Promise<void> {
  return new Promise((resolve, reject) => {
    socket.setNoDelay(true);
    let offset = 0;

    const writeNext = (): void => {
      if (offset >= buffer.length) {
        resolve();
        return;
      }

      const chunk = buffer.subarray(
        offset,
        Math.min(offset + TCP_CHUNK_SIZE, buffer.length),
      );
      offset += chunk.length;

      try {
        const canContinue = socket.write(chunk);
        if (canContinue) writeNext();
        else socket.once("drain", writeNext);
      } catch (err) {
        reject(err);
      }
    };

    writeNext();
  });
}

function tcpSendBuffer(
  ip: string,
  port: number,
  buffer: Buffer,
  plainText?: string,
  timeoutMs = TCP_PRINT_TIMEOUT_MS,
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
      void (async () => {
        connected = true;
        try {
          writeEscPosDebugLog(buffer, plainText);
          await writeBufferToSocket(socket, buffer);
          socket.end();
        } catch (writeErr) {
          socket.destroy();
          finish({
            success: false,
            error: friendlySocketError(writeErr as NodeJS.ErrnoException),
          });
        }
      })();
    });

    socket.setTimeout(timeoutMs);

    socket.on("timeout", () => {
      socket.destroy();
      finish({
        success: false,
        error: `Timeout (${timeoutMs}ms) al enviar a ${ip}:${port}`,
      });
    });

    socket.on("error", (err) => {
      if (!finished) {
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
  plainText?: string,
): Promise<TcpPrintResult> {
  const host = ip.trim();
  if (!host) {
    return { success: false, error: "IP de impresora no configurada" };
  }

  const safePort = port > 0 ? port : 9100;
  const first = await tcpSendBuffer(host, safePort, buffer, plainText);
  if (first.success) return first;

  const second = await tcpSendBuffer(host, safePort, buffer, plainText);
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
  return printTicket(ip, port, buffer, text);
}

/** Solo comprueba socket (ESC @), sin imprimir ticket completo. */
export async function probePrinter(
  ip: string,
  port: number,
): Promise<TcpPrintResult> {
  return printTicket(ip, port, CMD_INIT);
}

/** Prueba real: ticket TEST + corte parcial. */
export async function testPrinter(
  ip: string,
  port: number,
  advanced = false,
): Promise<TcpPrintResult> {
  const buffer = advanced
    ? buildAdvancedTestTicketBuffer()
    : buildTestTicketBuffer();
  return printTicket(ip, port, buffer);
}
