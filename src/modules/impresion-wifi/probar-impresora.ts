import { printTicket } from "@/modules/impresion-wifi/print-ticket";
import { TEST_IMPRESORA_TEXTO } from "@/types/impresora";

export async function probarImpresora() {
  return printTicket(TEST_IMPRESORA_TEXTO, "cocina", {
    tipo: "reimpresion",
  });
}
