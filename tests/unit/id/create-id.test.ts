import { afterEach, describe, expect, it, vi } from "vitest";

describe("createId", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("usa randomUUID cuando está disponible", async () => {
    const mockUuid = vi.fn(() => "uuid-mock-1234");
    vi.stubGlobal("crypto", { randomUUID: mockUuid });
    const { createId } = await import("@/lib/id/create-id");
    expect(createId()).toBe("uuid-mock-1234");
    expect(mockUuid).toHaveBeenCalledOnce();
  });

  it("usa fallback UUID si randomUUID no existe", async () => {
    vi.stubGlobal("crypto", {
      getRandomValues: (arr: Uint8Array) => {
        for (let i = 0; i < arr.length; i++) arr[i] = i;
        return arr;
      },
    });
    const { createId } = await import("@/lib/id/create-id");
    const { isValidUuid } = await import("@/lib/id/uuid");
    const id = createId();
    expect(isValidUuid(id)).toBe(true);
  });

  it("genera IDs únicos", async () => {
    vi.stubGlobal("crypto", {
      getRandomValues: (arr: Uint8Array) => {
        for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 256);
        return arr;
      },
    });
    const { createId } = await import("@/lib/id/create-id");
    const ids = new Set(Array.from({ length: 100 }, () => createId()));
    expect(ids.size).toBe(100);
  });

  it("no falla en entorno sin crypto", async () => {
    vi.stubGlobal("crypto", undefined);
    const { createId } = await import("@/lib/id/create-id");
    expect(() => createId()).not.toThrow();
    expect(() => createId("pref")).not.toThrow();
    expect(createId("pref")).toMatch(/^pref_/);
  });
});
