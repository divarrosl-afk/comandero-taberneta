import { describe, expect, it } from "vitest";
import { mesasRepositoryLocal } from "@/lib/mesas/mesas-repository-local";

describe("mesasRepositoryLocal", () => {
  it("getConfig devuelve mesas", async () => {
    const mesas = await mesasRepositoryLocal.getConfig();
    expect(mesas.length).toBeGreaterThan(0);
  });

  it("getById encuentra mesa", async () => {
    const config = await mesasRepositoryLocal.getConfig();
    const primera = config[0];
    const m = await mesasRepositoryLocal.getById(primera.id);
    expect(m?.codigo).toBe(primera.codigo);
  });
});
