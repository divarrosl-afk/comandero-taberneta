import { describe, expect, it } from "vitest";
import { menuDiaRepositoryLocal } from "@/lib/menu-dia/menu-dia-repository-local";

describe("menuDiaRepositoryLocal", () => {
  it("get devuelve menú del día", async () => {
    const menu = await menuDiaRepositoryLocal.get();
    expect(menu).toBeDefined();
    expect(menu.primerosIds).toBeDefined();
  });

  it("save y get persisten cambios", async () => {
    const menu = await menuDiaRepositoryLocal.get();
    await menuDiaRepositoryLocal.save({ ...menu, precioMenu: 19.5, activo: true });
    const leido = await menuDiaRepositoryLocal.get();
    expect(leido.precioMenu).toBe(19.5);
    expect(leido.activo).toBe(true);
  });
});
