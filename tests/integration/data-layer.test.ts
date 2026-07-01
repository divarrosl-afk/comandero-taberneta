import { describe, expect, it } from "vitest";
import { initializeDataLayer, getComandasRepository, resetDataLayerForTests } from "@/lib/data/data-layer";

describe("data-layer", () => {
  it("modo local usa repositorios locales", () => {
    resetDataLayerForTests();
    initializeDataLayer();
    const repo = getComandasRepository();
    expect(repo.crear).toBeDefined();
    expect(repo.getAll).toBeDefined();
  });
});
