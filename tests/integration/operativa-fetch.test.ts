import { describe, expect, it, vi } from "vitest";
import { comandaCocinaFixture } from "../setup/fixtures";

vi.mock("@/lib/comandas/comandas-service", () => ({
  fetchComandas: vi.fn(),
}));
vi.mock("@/lib/postres/postres-service", () => ({
  fetchPostres: vi.fn(),
}));

import { fetchComandas } from "@/lib/comandas/comandas-service";
import { fetchPostres } from "@/lib/postres/postres-service";
import { fetchOperativaData } from "@/lib/sync/operativa-fetch";

describe("fetchOperativaData", () => {
  it("deduplica peticiones concurrentes", async () => {
    let resolveFetch!: () => void;
    const gate = new Promise<void>((r) => {
      resolveFetch = r;
    });

    vi.mocked(fetchComandas).mockImplementation(
      () =>
        new Promise((resolve) => {
          gate.then(() => resolve([comandaCocinaFixture()]));
        }),
    );
    vi.mocked(fetchPostres).mockImplementation(
      () =>
        new Promise((resolve) => {
          gate.then(() => resolve([]));
        }),
    );

    const p1 = fetchOperativaData();
    const p2 = fetchOperativaData();
    resolveFetch();
    const [r1, r2] = await Promise.all([p1, p2]);
    expect(r1).toBe(r2);
    expect(fetchComandas).toHaveBeenCalledTimes(1);
    expect(fetchPostres).toHaveBeenCalledTimes(1);
  });
});
