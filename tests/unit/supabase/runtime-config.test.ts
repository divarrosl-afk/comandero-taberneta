import { describe, expect, it, beforeEach, afterEach } from "vitest";
import {
  clearClientRuntimeConfig,
  setClientRuntimeConfig,
} from "@/lib/supabase/runtime-config";
import { getSupabaseEnv, validateSupabaseSetup } from "@/lib/supabase/env";

describe("runtime supabase config", () => {
  const env = process.env;

  beforeEach(() => {
    process.env = { ...env };
    clearClientRuntimeConfig();
  });

  afterEach(() => {
    process.env = env;
    clearClientRuntimeConfig();
  });

  it("getSupabaseEnv usa runtime en cliente", () => {
    setClientRuntimeConfig({
      backend: "supabase",
      supabase: {
        url: "https://x.supabase.co",
        anonKey: "anon-runtime",
        restauranteId: "b1c2d3e4-f5a6-4789-a012-3456789abcde",
      },
    });

    expect(getSupabaseEnv()?.anonKey).toBe("anon-runtime");
  });

  it("validateSupabaseSetup ok con runtime en cliente", () => {
    setClientRuntimeConfig({
      backend: "supabase",
      supabase: {
        url: "https://x.supabase.co",
        anonKey: "anon-runtime",
        restauranteId: "b1c2d3e4-f5a6-4789-a012-3456789abcde",
      },
    });

    expect(validateSupabaseSetup()).toEqual({
      ok: true,
      backend: "supabase",
      missing: [],
    });
  });
});
