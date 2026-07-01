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

  it("usa fallback si randomUUID no existe", async () => {
    vi.stubGlobal("crypto", undefined);
    const { createId } = await import("@/lib/id/create-id");
    const id = createId();
    expect(id).toMatch(/^[a-z0-9]+-[a-z0-9]+-[a-z0-9]+$/);
  });

  it("genera IDs únicos", async () => {
    vi.stubGlobal("crypto", undefined);
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
