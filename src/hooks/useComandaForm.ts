"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { crearPlatoVacio, duplicarPlato } from "@/lib/comanda/plato-factory";
import { formEsValido } from "@/lib/comanda/map-form";
import {
  borradorTieneDatos,
  cargarBorrador,
  guardarBorrador,
  limpiarBorrador,
} from "@/lib/storage/borrador-comanda";
import type {
  ComandaFormState,
  ComandaFormStep,
  ModificacionId,
  PlatoFormItem,
  SeccionPlatos,
} from "@/types/comanda";
import type { ProductoCatalogo } from "@/types/catalogo";

const estadoInicial: ComandaFormState = {
  mesa: null,
  camareroId: null,
  entrantes: [crearPlatoVacio()],
  primeros: [crearPlatoVacio()],
  segundos: [crearPlatoVacio()],
  bebidas: [crearPlatoVacio()],
  extras: [],
  observaciones: [""],
};

const DEBOUNCE_MS = 400;

export function useComandaForm() {
  const [form, setForm] = useState<ComandaFormState>(estadoInicial);
  const [step, setStep] = useState<ComandaFormStep>("editar");
  const [borradorRecuperado, setBorradorRecuperado] = useState(false);
  const inicializado = useRef(false);

  useEffect(() => {
    if (inicializado.current) return;
    inicializado.current = true;

    const borrador = cargarBorrador();
    if (borrador && borradorTieneDatos(borrador)) {
      setForm(borrador);
      setBorradorRecuperado(true);
    }
  }, []);

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

  const setMesa = useCallback((mesa: number) => {
    setForm((prev) => ({ ...prev, mesa }));
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

  const addPlato = useCallback((seccion: SeccionPlatos) => {
    setForm((prev) => ({
      ...prev,
      [seccion]: [...prev[seccion], crearPlatoVacio()],
    }));
  }, []);

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

  const addPlatoFromCatalog = useCallback(
    (seccion: SeccionPlatos, producto: ProductoCatalogo) => {
      const platoData: Partial<PlatoFormItem> = {
        nombre: producto.nombre,
      };
      if (producto.suplemento) {
        platoData.tipoSeleccion = "menu_suplemento";
        platoData.suplemento = producto.suplemento;
      }

      setForm((prev) => {
        const vacio = prev[seccion].find((p) => !p.nombre.trim());
        if (vacio) {
          return {
            ...prev,
            [seccion]: prev[seccion].map((p) =>
              p.id === vacio.id ? { ...p, ...platoData } : p,
            ),
          };
        }
        return {
          ...prev,
          [seccion]: [...prev[seccion], { ...crearPlatoVacio(), ...platoData }],
        };
      });
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
    setForm(estadoInicial);
    setStep("editar");
    setBorradorRecuperado(false);
  }, []);

  const descartarBorrador = useCallback(() => {
    limpiarBorrador();
    setForm(estadoInicial);
    setBorradorRecuperado(false);
  }, []);

  const esValido = formEsValido(form);

  return {
    form,
    step,
    setStep,
    setMesa,
    setCamarero,
    updatePlato,
    addPlato,
    addPlatoFromCatalog,
    removePlato,
    duplicatePlato,
    clearSeccion,
    toggleModificacion,
    cycleSalsa,
    cycleExtra,
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
