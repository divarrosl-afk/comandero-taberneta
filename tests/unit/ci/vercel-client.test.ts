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

  it("getVercelEnvVars incluye SETUP_BOOTSTRAP_TOKEN para seed en Vercel", () => {
    process.env.SETUP_BOOTSTRAP_TOKEN = "test-bootstrap-token";
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service";
    process.env.NEXT_PUBLIC_RESTAURANTE_ID = "uuid";
    expect(getVercelEnvVars().SETUP_BOOTSTRAP_TOKEN).toBe("test-bootstrap-token");
  });
});
