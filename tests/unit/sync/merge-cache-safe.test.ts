import { describe, expect, it } from "vitest";
import { mergeOperativaSafe } from "@/lib/sync/merge-cache-safe";
import { comandaCocinaFixture } from "../../setup/fixtures";

describe("mergeOperativaSafe", () => {
  it("conserva pendientes si falla remoto", async () => {
    const cache: typeof import("@/types/comanda").ComandaCocina[] = [];
    const pendiente = comandaCocinaFixture({ id: "pending-1" });

    const merged = await mergeOperativaSafe(
      () => Promise.reject(new Error("sin red")),
      () => [pendiente],
      (data) => {
        cache.length = 0;
        cache.push(...data);
      },
    );

    expect(merged).toHaveLength(1);
    expect(merged[0].id).toBe("pending-1");
    expect(cache[0].id).toBe("pending-1");
  });
});
