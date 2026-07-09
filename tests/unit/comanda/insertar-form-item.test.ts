import { describe, expect, it } from "vitest";
import { crearPlatoVacio } from "@/lib/comanda/plato-factory";
import {
  insertarPlatoEnLista,
  insertarPostreEnLista,
} from "@/lib/comanda/insertar-form-item";
import { crearPostreVacio } from "@/lib/postres/postre-factory";

describe("insertar-form-item", () => {
  it("reutiliza línea vacía al insertar plato", () => {
    const vacio = crearPlatoVacio();
    const { lista, id } = insertarPlatoEnLista([vacio], {
      ...vacio,
      nombre: "Pan",
    });
    expect(id).toBe(vacio.id);
    expect(lista).toHaveLength(1);
    expect(lista[0].nombre).toBe("Pan");
  });

  it("añade postre nuevo si no hay vacío", () => {
    const existente = { ...crearPostreVacio(), nombre: "Flan" };
    const { lista, id } = insertarPostreEnLista([existente], {
      nombre: "Tarta",
    });
    expect(lista).toHaveLength(2);
    expect(lista.find((p) => p.id === id)?.nombre).toBe("Tarta");
  });
});
