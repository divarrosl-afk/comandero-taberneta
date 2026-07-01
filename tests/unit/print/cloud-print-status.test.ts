import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/lib/supabase/admin", () => ({
  getSupabaseAdminClient: vi.fn(),
}));

vi.mock("@/lib/supabase/env", () => ({
  getSupabaseEnv: vi.fn(),
}));

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { getCloudPrintStatus } from "@/lib/print/print-jobs-repository";

describe("getCloudPrintStatus", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.mocked(getSupabaseEnv).mockReturnValue({
      url: "https://x.supabase.co",
      anonKey: "anon",
      restauranteId: "b1c2d3e4-f5a6-4789-a012-3456789abcde",
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it("falla si falta service role", async () => {
    const status = await getCloudPrintStatus();
    expect(status.ready).toBe(false);
    expect(status.serviceRoleConfigured).toBe(false);
    expect(status.message).toContain("SUPABASE_SERVICE_ROLE_KEY");
  });

  it("falla si falta restaurante id", async () => {
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "secret");
    vi.mocked(getSupabaseEnv).mockReturnValue({
      url: "https://x.supabase.co",
      anonKey: "anon",
      restauranteId: null,
    });

    const status = await getCloudPrintStatus();
    expect(status.ready).toBe(false);
    expect(status.message).toContain("RESTAURANTE_ID");
  });

  it("ok cuando la tabla responde", async () => {
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "secret");
    vi.mocked(getSupabaseAdminClient).mockReturnValue({
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            in: vi.fn(async () => ({ count: 2, error: null })),
          })),
        })),
      })),
    } as never);

    const status = await getCloudPrintStatus();
    expect(status.ready).toBe(true);
    expect(status.tableExists).toBe(true);
    expect(status.pendingCount).toBe(2);
    expect(status.message).toContain("pendiente");
  });
});
