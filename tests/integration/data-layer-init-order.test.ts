import { describe, expect, it, beforeEach, vi } from "vitest";
import {
  getComandasRepository,
  initializeDataLayer,
  isRemoteOperativaReady,
  resetDataLayerForTests,
} from "@/lib/data/data-layer";
import { comandasRepositoryApi } from "@/lib/comandas/comandas-repository-api";
import { comandasRepositoryLocal } from "@/lib/comandas/comandas-repository-local";
import { setClientRuntimeConfig, clearClientRuntimeConfig } from "@/lib/supabase/runtime-config";

describe("data-layer init order", () => {
  beforeEach(() => {
    resetDataLayerForTests();
    clearClientRuntimeConfig();
  });

  it("usa repositorio local antes de runtime config", () => {
    vi.stubEnv("NEXT_PUBLIC_DATA_BACKEND", "local");
    expect(getComandasRepository()).toBe(comandasRepositoryLocal);
    expect(isRemoteOperativaReady()).toBe(true);
  });

  it("activa API remota tras runtime config + initializeDataLayer", () => {
    setClientRuntimeConfig({
      backend: "supabase",
      supabase: {
        url: "https://example.supabase.co",
        anonKey: "anon",
        restauranteId: "b1c2d3e4-f5a6-4789-a012-3456789abcde",
      },
    });
    initializeDataLayer();

    expect(getComandasRepository()).toBe(comandasRepositoryApi);
    expect(isRemoteOperativaReady()).toBe(true);
  });

  it("getComandasRepository inicializa lazy si hay runtime config", () => {
    setClientRuntimeConfig({
      backend: "supabase",
      supabase: {
        url: "https://example.supabase.co",
        anonKey: "anon",
        restauranteId: "b1c2d3e4-f5a6-4789-a012-3456789abcde",
      },
    });

    expect(getComandasRepository()).toBe(comandasRepositoryApi);
    expect(isRemoteOperativaReady()).toBe(true);
  });
});
