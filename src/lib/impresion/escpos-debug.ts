import fs from "node:fs";
import path from "node:path";
import { bufferToDebugText } from "@/lib/impresion/escpos-encode";

const DEBUG_DIR = path.join(process.cwd(), "print-server", "logs");
const DEBUG_BIN = path.join(DEBUG_DIR, "last-ticket.bin");
const DEBUG_TXT = path.join(DEBUG_DIR, "last-ticket.txt");

export function isEscPosDebugEnabled(): boolean {
  const v = process.env.PRINT_DEBUG?.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

/** Guarda último buffer enviado (solo si PRINT_DEBUG=1). */
export function writeEscPosDebugLog(buffer: Buffer, plainText?: string): void {
  if (!isEscPosDebugEnabled()) return;

  fs.mkdirSync(DEBUG_DIR, { recursive: true });
  fs.writeFileSync(DEBUG_BIN, buffer);
  const readable =
    plainText?.trim() ||
    bufferToDebugText(buffer) ||
    buffer.toString("latin1");
  fs.writeFileSync(DEBUG_TXT, readable, "utf8");
}
