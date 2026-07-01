import { describe, expect, it } from "vitest";
import { usuariosRepositoryLocal } from "@/lib/auth/usuarios-repository-local";

describe("usuariosRepositoryLocal", () => {
  it("getAll incluye usuarios iniciales", async () => {
    const usuarios = await usuariosRepositoryLocal.getAll();
    expect(usuarios.some((u) => u.username === "divarro")).toBe(true);
  });

  it("getByUsername encuentra camarero", async () => {
    const david = await usuariosRepositoryLocal.getByUsername("david");
    expect(david?.rol).toBe("CAMARERO");
  });
});
