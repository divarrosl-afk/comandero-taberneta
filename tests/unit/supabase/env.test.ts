import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { getSupabaseEnv } from "@/lib/supabase/env";

describe("getSupabaseEnv", () => {
  const env = process.env;

  beforeEach(() => {
    process.env = { ...env };
  });

  afterEach(() => {
    process.env = env;
  });

  it("acepta NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY como anon key", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://x.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_test";
    process.env.NEXT_PUBLIC_RESTAURANTE_ID = "b1c2d3e4-f5a6-4789-a012-3456789abcde";

    expect(getSupabaseEnv()).toEqual({
      url: "https://x.supabase.co",
      anonKey: "sb_publishable_test",
      restauranteId: "b1c2d3e4-f5a6-4789-a012-3456789abcde",
    });
  });
});
