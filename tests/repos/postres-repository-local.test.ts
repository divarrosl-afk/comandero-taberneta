import { describe, expect, it } from "vitest";
import { postresRepositoryLocal } from "@/lib/postres/postres-repository-local";
import { comandaPostresFixture } from "../setup/fixtures";

describe("postresRepositoryLocal", () => {
  it("crear y actualizar estado", async () => {
    await postresRepositoryLocal.crear(comandaPostresFixture({ id: "repo-p1" }));
    const updated = await postresRepositoryLocal.actualizarEstado(
      "repo-p1",
      "tiene_primeros",
    );
    expect(updated?.estadoPanel).toBe("tiene_primeros");
  });
});
