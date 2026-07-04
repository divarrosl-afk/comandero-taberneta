import { describe, expect, it } from "vitest";
import { MENU_DIA_DEFAULT } from "@/types/menu-dia";
import { menuTienePlatosImportados } from "@/lib/menu-dia/menu-platos-comanda";

describe("menu persistencia", () => {
  it("detecta menú con platos importados", () => {
    expect(menuTienePlatosImportados(MENU_DIA_DEFAULT)).toBe(false);
    expect(
      menuTienePlatosImportados({
        ...MENU_DIA_DEFAULT,
        activo: true,
        primerosImportados: [{ id: "a", nombre: "Gazpacho" }],
      }),
    ).toBe(true);
  });
});
