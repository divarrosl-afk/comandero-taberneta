import { describe, expect, it, vi } from "vitest";
import {
  ensureUuid,
  generateUuidV4,
  isValidUuid,
} from "@/lib/id/uuid";

describe("uuid", () => {
  it("valida UUID v4", () => {
    const id = generateUuidV4();
    expect(isValidUuid(id)).toBe(true);
    expect(isValidUuid("T1")).toBe(false);
    expect(isValidUuid("abc-123")).toBe(false);
  });

  it("ensureUuid genera UUID si el valor no es válido", () => {
    const id = ensureUuid("MESA-1");
    expect(isValidUuid(id)).toBe(true);
  });

  it("ensureUuid conserva UUID válido", () => {
    const original = "550e8400-e29b-41d4-a716-446655440000";
    expect(ensureUuid(original)).toBe(original);
  });

  it("generateUuidV4 funciona sin crypto.randomUUID", () => {
    const original = globalThis.crypto?.randomUUID;
    vi.stubGlobal("crypto", {
      getRandomValues: (arr: Uint8Array) => {
        for (let i = 0; i < arr.length; i++) arr[i] = i;
        return arr;
      },
    });
    const id = generateUuidV4();
    expect(isValidUuid(id)).toBe(true);
    if (original) {
      vi.stubGlobal("crypto", { ...globalThis.crypto, randomUUID: original });
    }
  });
});
