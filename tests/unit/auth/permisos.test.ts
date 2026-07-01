import { describe, expect, it } from "vitest";
import {
  puedeAccederCierre,
  puedeAccederConfigCatalogo,
  puedeBorrarHistorial,
  puedeCrearComandas,
  puedeVerPanel,
} from "@/lib/auth/permisos";

describe("permisos", () => {
  it("ADMIN accede a configuración y cierre", () => {
    expect(puedeAccederConfigCatalogo("ADMIN")).toBe(true);
    expect(puedeAccederCierre("ADMIN")).toBe(true);
    expect(puedeBorrarHistorial("ADMIN")).toBe(true);
  });

  it("CAMARERO no accede a configuración ni cierre ni borrar historial", () => {
    expect(puedeAccederConfigCatalogo("CAMARERO")).toBe(false);
    expect(puedeAccederCierre("CAMARERO")).toBe(false);
    expect(puedeBorrarHistorial("CAMARERO")).toBe(false);
  });

  it("CAMARERO puede crear comandas y ver panel", () => {
    expect(puedeCrearComandas("CAMARERO")).toBe(true);
    expect(puedeVerPanel("CAMARERO")).toBe(true);
  });
});
