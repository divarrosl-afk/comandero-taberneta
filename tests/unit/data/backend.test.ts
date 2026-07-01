import { describe, expect, it, vi } from "vitest";
import {
  getDataBackend,
  isLocalBackend,
  isSupabaseBackend,
  usesRemoteData,
} from "@/lib/data/backend";

describe("backend selector", () => {
  it("default es local", () => {
    vi.stubEnv("NEXT_PUBLIC_DATA_BACKEND", "");
    expect(getDataBackend()).toBe("local");
    expect(isLocalBackend()).toBe(true);
    expect(usesRemoteData()).toBe(false);
  });

  it("supabase activa datos remotos", () => {
    vi.stubEnv("NEXT_PUBLIC_DATA_BACKEND", "supabase");
    expect(isSupabaseBackend()).toBe(true);
    expect(usesRemoteData()).toBe(true);
  });

  it("hybrid activa datos remotos", () => {
    vi.stubEnv("NEXT_PUBLIC_DATA_BACKEND", "hybrid");
    expect(usesRemoteData()).toBe(true);
  });

  it("valor inválido cae a local", () => {
    vi.stubEnv("NEXT_PUBLIC_DATA_BACKEND", "invalid");
    expect(getDataBackend()).toBe("local");
  });
});
