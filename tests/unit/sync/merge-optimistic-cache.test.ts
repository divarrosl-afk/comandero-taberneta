import { describe, expect, it } from "vitest";
import { mergeOptimisticCache } from "@/lib/sync/merge-operativa";

describe("mergeOptimisticCache", () => {
  it("conserva comandas en caché aún no devueltas por Supabase", () => {
    const merged = [{ id: "r1", creadaEn: "2025-01-01T10:00:00Z", label: "remoto" }];
    const cache = [
      { id: "r1", creadaEn: "2025-01-01T10:00:00Z", label: "remoto" },
      { id: "local-1", creadaEn: "2025-01-01T11:00:00Z", label: "nueva" },
    ];
    const result = mergeOptimisticCache(merged, cache);
    expect(result).toHaveLength(2);
    expect(result.find((x) => x.id === "local-1")?.label).toBe("nueva");
  });
});
