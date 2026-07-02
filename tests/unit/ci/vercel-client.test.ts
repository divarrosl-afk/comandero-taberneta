import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { getVercelConfig, readEnv } from "../../../scripts/ci/vercel-client.mjs";

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
});
