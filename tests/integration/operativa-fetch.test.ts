import { describe, expect, it, vi } from "vitest";
import { comandaCocinaFixture } from "../setup/fixtures";

vi.mock("@/lib/sync/operativa-read", () => ({
  loadOperativaMerged: vi.fn(),
}));

import { loadOperativaMerged } from "@/lib/sync/operativa-read";
import { fetchOperativaData } from "@/lib/sync/operativa-fetch";

describe("fetchOperativaData", () => {
  it("deduplica peticiones concurrentes", async () => {
    let resolveFetch!: () => void;
    const gate = new Promise<void>((r) => {
      resolveFetch = r;
    });

    vi.mocked(loadOperativaMerged).mockImplementation(
      () =>
        new Promise((resolve) => {
          gate.then(() =>
            resolve({ cocina: [comandaCocinaFixture()], postres: [] }),
          );
        }),
    );

    const p1 = fetchOperativaData();
    const p2 = fetchOperativaData();
    resolveFetch();
    const [r1, r2] = await Promise.all([p1, p2]);
    expect(r1).toBe(r2);
    expect(loadOperativaMerged).toHaveBeenCalledTimes(1);
  });
});
