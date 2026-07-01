import { describe, expect, it } from "vitest";
import {
  puedeAccederConfigCatalogo,
  puedeAccederCierre,
  puedeBorrarHistorial,
} from "@/lib/auth/permisos";

describe("seguridad permisos UI", () => {
  it("camarero no accede a configuración ni borrar historial", () => {
    expect(puedeAccederConfigCatalogo("CAMARERO")).toBe(false);
    expect(puedeAccederCierre("CAMARERO")).toBe(false);
    expect(puedeBorrarHistorial("CAMARERO")).toBe(false);
  });

  it("admin accede a configuración y cierre", () => {
    expect(puedeAccederConfigCatalogo("ADMIN")).toBe(true);
    expect(puedeAccederCierre("ADMIN")).toBe(true);
    expect(puedeBorrarHistorial("ADMIN")).toBe(true);
  });
});
