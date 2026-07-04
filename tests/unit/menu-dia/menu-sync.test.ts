import { describe, expect, it } from "vitest";
import { MENU_DIA_DEFAULT } from "@/types/menu-dia";
import { elegirMenuLocal } from "@/lib/menu-dia/menu-dia-service";

const menuConPlatos = {
  ...MENU_DIA_DEFAULT,
  activo: true,
  primerosImportados: [{ id: "a", nombre: "Gazpacho" }],
};

describe("elegirMenuLocal", () => {
  it("prefiere remoto si tiene platos importados", () => {
    const local = { ...menuConPlatos, primerosImportados: [{ id: "b", nombre: "Local" }] };
    const remoto = { ...menuConPlatos, primerosImportados: [{ id: "c", nombre: "Remoto" }] };
    expect(elegirMenuLocal(local, remoto).primerosImportados?.[0]?.nombre).toBe("Remoto");
  });

  it("usa local si remoto está vacío (modo offline)", () => {
    const local = menuConPlatos;
    const remoto = MENU_DIA_DEFAULT;
    expect(elegirMenuLocal(local, remoto)).toBe(local);
  });

  it("en modo offline mantiene local si remoto está vacío", () => {
    const local = menuConPlatos;
    const remoto = { ...MENU_DIA_DEFAULT, activo: false };
    expect(elegirMenuLocal(local, remoto)).toBe(local);
  });
});

describe("app sync", () => {
  it("define intervalo de 10 segundos", async () => {
    const { APP_SYNC_POLL_MS } = await import("@/lib/sync/constants");
    expect(APP_SYNC_POLL_MS).toBe(10_000);
  });
});
