import { describe, expect, it, beforeEach, afterEach } from "vitest";
import {
  getVercelConfig,
  getVercelEnvVars,
  readEnv,
} from "../../../scripts/ci/vercel-client.mjs";

describe("vercel-client", () => {
  const env = process.env;

  beforeEach(() => {
    process.env = { ...env };
  });

  afterEach(() => {
    process.env = env;
  });

  it("readEnv trata cadena vacía como ausente", () => {
    process.env.VERCEL_PROJECT_ID = "";
    expect(readEnv("VERCEL_PROJECT_ID", "default-prj")).toBe("default-prj");
  });

  it("getVercelConfig usa project id por defecto si el secreto está vacío", () => {
    process.env.VERCEL_PROJECT_ID = "";
    expect(getVercelConfig().projectId).toBe("prj_ei4K1jhbYegz3SKHmBrcdl3XHNZI");
  });

  it("getVercelEnvVars incluye SEED_* solo si están definidos", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service";
    process.env.NEXT_PUBLIC_RESTAURANTE_ID = "uuid";
    const base = getVercelEnvVars();
    expect(base.SEED_ADMIN_PASSWORD).toBeUndefined();
    process.env.SEED_ADMIN_PASSWORD = "admin-pass";
    process.env.SEED_CAMARERO_PASSWORD = "camarero-pass";
    const withSeed = getVercelEnvVars();
    expect(withSeed.SEED_ADMIN_PASSWORD).toBe("admin-pass");
    expect(withSeed.SEED_CAMARERO_PASSWORD).toBe("camarero-pass");
  });
});
