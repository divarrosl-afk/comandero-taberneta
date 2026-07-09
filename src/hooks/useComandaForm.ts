"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { crearPlatoVacio, duplicarPlato } from "@/lib/comanda/plato-factory";
import {
  idLineaVaciaPlatos,
  idLineaVaciaPostres,
  insertarPlatoEnLista,
  insertarPostreEnLista,
} from "@/lib/comanda/insertar-form-item";
import { formEsValido } from "@/lib/comanda/map-form";
import {
  borradorTieneDatos,
  cargarBorrador,
  guardarBorrador,
  limpiarBorrador,
  normalizarBorrador,
} from "@/lib/storage/borrador-comanda";
import type {
  ComandaFormState,
  ComandaFormStep,
  ModificacionId,
  PlatoFormItem,
  SeccionPlatos,
} from "@/types/comanda";
import { platoFieldsFromProducto } from "@/lib/carta/plato-from-producto";
import { useMenuDia } from "@/hooks/useMenuDia";
import type { ProductoCatalogo } from "@/types/catalogo";
import {
  crearPostreVacio,
  duplicarPostre,
} from "@/lib/postres/postre-factory";
import type { EstadoCafeX, PostreFormItem } from "@/types/postres";

const estadoInicial: ComandaFormState = {
  mesa: null,
  camareroId: null,
  entrantes: [crearPlatoVacio()],
  primeros: [crearPlatoVacio()],
  segundos: [crearPlatoVacio()],
  bebidas: [crearPlatoVacio()],
  postres: [crearPostreVacio()],
  cafes: [crearPostreVacio()],
  estadoXCafe: null,
  comensales: null,
  extras: [],
  observaciones: [""],
};

const DEBOUNCE_MS = 400;

function aplicarCamareroFijo(
  form: ComandaFormState,
  camareroFijo: string | null | undefined,
): ComandaFormState {
  if (!camareroFijo) return form;
  return { ...form, camareroId: camareroFijo };
}

function estadoConCamarero(
  camareroFijo: string | null | undefined,
): ComandaFormState {
  if (!camareroFijo) return estadoInicial;
  return { ...estadoInicial, camareroId: camareroFijo };
}

function estadoConMesa(
  mesaInicial: string | null | undefined,
  camareroFijo: string | null | undefined,
): ComandaFormState {
  const base = estadoConCamarero(camareroFijo);
  if (mesaInicial) return { ...base, mesa: mesaInicial };
  return base;
}

export function useComandaForm(
  camareroFijo?: string | null,
  mesaInicial?: string | null,
) {
  const [form, setForm] = useState<ComandaFormState>(estadoInicial);
  const [step, setStep] = useState<ComandaFormStep>("editar");
  const [borradorRecuperado, setBorradorRecuperado] = useState(false);
  const inicializado = useRef(false);
  const { menu } = useMenuDia();

  useEffect(() => {
    if (inicializado.current) return;
    inicializado.current = true;

    const borrador = cargarBorrador();
    if (borrador && borradorTieneDatos(borrador)) {
      setForm(aplicarCamareroFijo(normalizarBorrador(borrador), camareroFijo));
      setBorradorRecuperado(true);
    } else {
      const base = camareroFijo
        ? estadoConCamarero(camareroFijo)
        : estadoInicial;
      if (mesaInicial) {
        setForm({ ...base, mesa: mesaInicial });
      } else if (camareroFijo) {
        setForm(base);
      }
    }
  }, [camareroFijo, mesaInicial]);

  useEffect(() => {
    if (!inicializado.current) return;

    const timer = setTimeout(() => {
      if (step === "enviada") return;
      if (borradorTieneDatos(form)) {
        guardarBorrador(form);
      } else {
        limpiarBorrador();
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [form, step]);

  const setMesa = useCallback((mesa: string) => {
    setForm((prev) => ({ ...prev, mesa }));
  }, []);

  const setComensales = useCallback((comensales: number | null) => {
    setForm((prev) => ({ ...prev, comensales }));
  }, []);

  const setCamarero = useCallback((camareroId: string) => {
    setForm((prev) => ({ ...prev, camareroId }));
  }, []);

  const updatePlato = useCallback(
    (seccion: SeccionPlatos, id: string, cambios: Partial<PlatoFormItem>) => {
      setForm((prev) => ({
        ...prev,
        [seccion]: prev[seccion].map((p) =>
          p.id === id ? { ...p, ...cambios } : p,
        ),
      }));
    },
    [],
  );

  const addPlato = useCallback((seccion: SeccionPlatos): string => {
    const nuevo = crearPlatoVacio();
    let resolvedId = nuevo.id;
    setForm((prev) => {
      const vacioId = idLineaVaciaPlatos(prev[seccion]);
      if (vacioId) {
        resolvedId = vacioId;
        return prev;
      }
      return { ...prev, [seccion]: [...prev[seccion], nuevo] };
    });
    return resolvedId;
  }, []);

  const confirmPlato = useCallback(
    (seccion: SeccionPlatos, plato: PlatoFormItem): string => {
      let resolvedId = plato.id;
      setForm((prev) => {
        const { lista, id } = insertarPlatoEnLista(prev[seccion], plato);
        resolvedId = id;
        return { ...prev, [seccion]: lista };
      });
      return resolvedId;
    },
    [],
  );

  const confirmPlatoDesdeCatalogo = useCallback(
    (seccion: SeccionPlatos, producto: ProductoCatalogo): string => {
      if (!producto.activo || producto.agotado) return "";

      const platoData = platoFieldsFromProducto(producto, { seccion, menu });
      const plato: PlatoFormItem = {
        ...crearPlatoVacio(),
        ...platoData,
        nombre: producto.nombre,
      };
      return confirmPlato(seccion, plato);
    },
    [confirmPlato, menu],
  );

  const removePlato = useCallback((seccion: SeccionPlatos, id: string) => {
    setForm((prev) => {
      const lista = prev[seccion].filter((p) => p.id !== id);
      return {
        ...prev,
        [seccion]: lista.length ? lista : [crearPlatoVacio()],
      };
    });
  }, []);

  const duplicatePlato = useCallback((seccion: SeccionPlatos, id: string) => {
    setForm((prev) => {
      const index = prev[seccion].findIndex((p) => p.id === id);
      if (index === -1) return prev;

      const copia = duplicarPlato(prev[seccion][index]);
      const lista = [...prev[seccion]];
      lista.splice(index + 1, 0, copia);

      return { ...prev, [seccion]: lista };
    });
  }, []);

  const clearSeccion = useCallback((seccion: SeccionPlatos) => {
    setForm((prev) => ({
      ...prev,
      [seccion]: [crearPlatoVacio()],
    }));
  }, []);

  const toggleModificacion = useCallback(
    (seccion: SeccionPlatos, platoId: string, mod: ModificacionId) => {
      setForm((prev) => ({
        ...prev,
        [seccion]: prev[seccion].map((p) => {
          if (p.id !== platoId) return p;
          const tiene = p.modificaciones.includes(mod);
          return {
            ...p,
            modificaciones: tiene
              ? p.modificaciones.filter((m) => m !== mod)
              : [...p.modificaciones, mod],
          };
        }),
      }));
    },
    [],
  );

  const cycleSalsa = useCallback(
    (seccion: SeccionPlatos, platoId: string, salsaId: string, nombre: string) => {
      setForm((prev) => ({
        ...prev,
        [seccion]: prev[seccion].map((p) => {
          if (p.id !== platoId) return p;

          const existente = p.salsas.find((s) => s.id === salsaId);
          if (!existente) {
            return {
              ...p,
              salsas: [...p.salsas, { id: salsaId, nombre, cantidad: 1 }],
            };
          }

          if (existente.cantidad < 3) {
            return {
              ...p,
              salsas: p.salsas.map((s) =>
                s.id === salsaId
                  ? { ...s, cantidad: (s.cantidad + 1) as 1 | 2 | 3 }
                  : s,
              ),
            };
          }

          return { ...p, salsas: p.salsas.filter((s) => s.id !== salsaId) };
        }),
      }));
    },
    [],
  );

  const setExtraCantidad = useCallback(
    (extraId: string, nombre: string, cantidad: number) => {
      setForm((prev) => {
        const extras = prev.extras.filter((e) => e.id !== extraId);
        if (cantidad > 0) {
          extras.push({ id: extraId, nombre, cantidad });
        }
        return { ...prev, extras };
      });
    },
    [],
  );

  const cycleExtra = useCallback((extraId: string, nombre: string) => {
    setForm((prev) => {
      const actual = prev.extras.find((e) => e.id === extraId)?.cantidad ?? 0;
      const siguiente = actual >= 3 ? 0 : actual + 1;
      const extras = prev.extras.filter((e) => e.id !== extraId);

      if (siguiente > 0) {
        extras.push({ id: extraId, nombre, cantidad: siguiente });
      }

      return { ...prev, extras };
    });
  }, []);

  const updatePostre = useCallback(
    (id: string, cambios: Partial<PostreFormItem>) => {
      setForm((prev) => ({
        ...prev,
        postres: prev.postres.map((p) =>
          p.id === id ? { ...p, ...cambios } : p,
        ),
      }));
    },
    [],
  );

  const addPostre = useCallback((): string => {
    const nuevo = crearPostreVacio();
    let resolvedId = nuevo.id;
    setForm((prev) => {
      const vacioId = idLineaVaciaPostres(prev.postres);
      if (vacioId) {
        resolvedId = vacioId;
        return prev;
      }
      return { ...prev, postres: [...prev.postres, nuevo] };
    });
    return resolvedId;
  }, []);

  const addPostreFrecuente = useCallback((producto: ProductoCatalogo): string => {
    let resolvedId = "";
    setForm((prev) => {
      const { lista, id } = insertarPostreEnLista(prev.postres, {
        nombre: producto.nombre,
      });
      resolvedId = id;
      return { ...prev, postres: lista };
    });
    return resolvedId;
  }, []);

  const removePostre = useCallback((id: string) => {
    setForm((prev) => {
      const lista = prev.postres.filter((p) => p.id !== id);
      return {
        ...prev,
        postres: lista.length ? lista : [crearPostreVacio()],
      };
    });
  }, []);

  const duplicatePostre = useCallback((id: string) => {
    setForm((prev) => {
      const index = prev.postres.findIndex((p) => p.id === id);
      if (index === -1) return prev;
      const copia = duplicarPostre(prev.postres[index]);
      const lista = [...prev.postres];
      lista.splice(index + 1, 0, copia);
      return { ...prev, postres: lista };
    });
  }, []);

  const clearPostres = useCallback(() => {
    setForm((prev) => ({ ...prev, postres: [crearPostreVacio()] }));
  }, []);

  const updateCafe = useCallback(
    (id: string, cambios: Partial<PostreFormItem>) => {
      setForm((prev) => ({
        ...prev,
        cafes: prev.cafes.map((c) =>
          c.id === id ? { ...c, ...cambios } : c,
        ),
      }));
    },
    [],
  );

  const addCafe = useCallback((): string => {
    const nuevo = crearPostreVacio();
    let resolvedId = nuevo.id;
    setForm((prev) => {
      const vacioId = idLineaVaciaPostres(prev.cafes);
      if (vacioId) {
        resolvedId = vacioId;
        return prev;
      }
      return { ...prev, cafes: [...prev.cafes, nuevo] };
    });
    return resolvedId;
  }, []);

  const addCafeRapido = useCallback((nombre: string): string => {
    let resolvedId = "";
    setForm((prev) => {
      const { lista, id } = insertarPostreEnLista(prev.cafes, { nombre });
      resolvedId = id;
      return { ...prev, cafes: lista };
    });
    return resolvedId;
  }, []);

  const removeCafe = useCallback((id: string) => {
    setForm((prev) => {
      const lista = prev.cafes.filter((c) => c.id !== id);
      return {
        ...prev,
        cafes: lista.length ? lista : [crearPostreVacio()],
      };
    });
  }, []);

  const duplicateCafe = useCallback((id: string) => {
    setForm((prev) => {
      const index = prev.cafes.findIndex((c) => c.id === id);
      if (index === -1) return prev;
      const copia = duplicarPostre(prev.cafes[index]);
      const lista = [...prev.cafes];
      lista.splice(index + 1, 0, copia);
      return { ...prev, cafes: lista };
    });
  }, []);

  const clearCafes = useCallback(() => {
    setForm((prev) => ({ ...prev, cafes: [crearPostreVacio()] }));
  }, []);

  const setEstadoXCafe = useCallback((estado: EstadoCafeX | null) => {
    setForm((prev) => ({
      ...prev,
      estadoXCafe: prev.estadoXCafe === estado ? null : estado,
    }));
  }, []);

  const setObservacion = useCallback((index: number, valor: string) => {
    setForm((prev) => {
      const observaciones = [...prev.observaciones];
      observaciones[index] = valor;
      return { ...prev, observaciones };
    });
  }, []);

  const addObservacion = useCallback(() => {
    setForm((prev) => ({
      ...prev,
      observaciones: [...prev.observaciones, ""],
    }));
  }, []);

  const removeObservacion = useCallback((index: number) => {
    setForm((prev) => {
      const observaciones = prev.observaciones.filter((_, i) => i !== index);
      return {
        ...prev,
        observaciones: observaciones.length ? observaciones : [""],
      };
    });
  }, []);

  const appendObservacionRapida = useCallback((texto: string) => {
    setForm((prev) => {
      const vacia = prev.observaciones.findIndex((o) => !o.trim());
      if (vacia !== -1) {
        const observaciones = [...prev.observaciones];
        observaciones[vacia] = texto;
        return { ...prev, observaciones };
      }
      return { ...prev, observaciones: [...prev.observaciones, texto] };
    });
  }, []);

  const reset = useCallback(() => {
    limpiarBorrador();
    setForm(estadoConMesa(mesaInicial, camareroFijo));
    setStep("editar");
    setBorradorRecuperado(false);
  }, [camareroFijo, mesaInicial]);

  const descartarBorrador = useCallback(() => {
    limpiarBorrador();
    setForm(estadoConMesa(mesaInicial, camareroFijo));
    setBorradorRecuperado(false);
  }, [camareroFijo, mesaInicial]);

  const esValido = formEsValido(form);

  return {
    form,
    step,
    setStep,
    setMesa,
    setComensales,
    setCamarero,
    updatePlato,
    addPlato,
    confirmPlato,
    confirmPlatoDesdeCatalogo,
    removePlato,
    duplicatePlato,
    clearSeccion,
    toggleModificacion,
    cycleSalsa,
    cycleExtra,
    setExtraCantidad,
    updatePostre,
    addPostre,
    addPostreFrecuente,
    removePostre,
    duplicatePostre,
    clearPostres,
    updateCafe,
    addCafe,
    addCafeRapido,
    removeCafe,
    duplicateCafe,
    clearCafes,
    setEstadoXCafe,
    setObservacion,
    addObservacion,
    removeObservacion,
    appendObservacionRapida,
    reset,
    descartarBorrador,
    borradorRecuperado,
    esValido,
  };
}
