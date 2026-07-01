import { describe, expect, it } from "vitest";
import { printStatusLabel } from "@/modules/impresion-wifi/print-ticket";
import { PRINT_MESSAGES, PRINT_STATUS_LABELS } from "@/modules/impresion-wifi/types";

describe("printStatusLabel", () => {
  it("mapea estados del print-server", () => {
    expect(printStatusLabel("queued")).toBe(PRINT_STATUS_LABELS.queued);
    expect(printStatusLabel("printing")).toBe(PRINT_STATUS_LABELS.printing);
    expect(printStatusLabel("printed")).toBe(PRINT_STATUS_LABELS.printed);
    expect(printStatusLabel("error")).toBe(PRINT_STATUS_LABELS.error);
  });

  it("sin estado devuelve enviando", () => {
    expect(printStatusLabel(undefined)).toBe(PRINT_MESSAGES.enviando);
  });
});
