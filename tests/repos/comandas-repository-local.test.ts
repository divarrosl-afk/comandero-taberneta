import { describe, expect, it } from "vitest";
import { comandasRepositoryLocal } from "@/lib/comandas/comandas-repository-local";
import { comandaCocinaFixture } from "../setup/fixtures";

describe("comandasRepositoryLocal", () => {
  it("crear y getAll", async () => {
    const c = comandaCocinaFixture({ id: "repo-c1" });
    await comandasRepositoryLocal.crear(c);
    const todas = await comandasRepositoryLocal.getAll();
    expect(todas.some((x) => x.id === "repo-c1")).toBe(true);
  });

  it("actualizarEstado", async () => {
    await comandasRepositoryLocal.crear(
      comandaCocinaFixture({ id: "repo-c2" }),
    );
    const updated = await comandasRepositoryLocal.actualizarEstado(
      "repo-c2",
      "bebidas",
    );
    expect(updated?.estadoPanel).toBe("bebidas");
  });
});
