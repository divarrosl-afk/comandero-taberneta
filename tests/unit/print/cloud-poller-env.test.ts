import { describe, expect, it, beforeEach, afterEach } from "vitest";
import {
  getMissingCloudEnv,
  isSupabaseConfigured,
  readCloudEnv,
} from "../../../print-server/lib/supabase-env.js";
import { getCloudPollerStatus } from "../../../print-server/lib/cloud-poller.js";

describe("print-server supabase-env", () => {
  const env = process.env;

  beforeEach(() => {
    process.env = { ...env };
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.SUPABASE_RESTAURANTE_ID;
    delete process.env.CLOUD_POLL_MS;
  });

  afterEach(() => {
    process.env = env;
  });

  it("detecta variables Supabase faltantes", () => {
    expect(getMissingCloudEnv()).toEqual([
      "NEXT_PUBLIC_SUPABASE_URL",
      "SUPABASE_SERVICE_ROLE_KEY",
      "SUPABASE_RESTAURANTE_ID",
    ]);
    expect(isSupabaseConfigured()).toBe(false);
  });

  it("marca configurado cuando las 3 variables existen", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-key";
    process.env.SUPABASE_RESTAURANTE_ID = "uuid-restaurante";
    process.env.CLOUD_POLL_MS = "5000";

    expect(getMissingCloudEnv()).toEqual([]);
    expect(isSupabaseConfigured()).toBe(true);
    expect(readCloudEnv().pollMs).toBe(5000);
  });

  it("getCloudPollerStatus expone campos planos de /health", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-key";
    process.env.SUPABASE_RESTAURANTE_ID = "uuid-restaurante";

    const status = getCloudPollerStatus();
    expect(status.supabaseConfigured).toBe(true);
    expect(status.missingCloudEnv).toEqual([]);
    expect(status.cloudPollMs).toBe(3000);
    expect(status.cloudPolling).toBe(false);
  });
});
