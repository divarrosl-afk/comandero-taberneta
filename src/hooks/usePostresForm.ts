"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  crearPostreVacio,
  duplicarPostre,
} from "@/lib/postres/postre-factory";
import { formPostresEsValido } from "@/lib/postres/map-form";
import {
  borradorPostresTieneDatos,
  cargarBorradorPostres,
  guardarBorradorPostres,
  limpiarBorradorPostres,
} from "@/lib/storage/borrador-postres";
import type { ProductoCatalogo } from "@/types/catalogo";
import type {
  EstadoPostreX,
  PostreFormItem,
  PostresFormState,
  PostresFormStep,
} from "@/types/postres";

const estadoInicial: PostresFormState = {
  mesa: null,
  camareroId: null,
  postres: [crearPostreVacio()],
  cafes: [crearPostreVacio()],
  estadoX: null,
  estadoXCafe: null,
  clH: false,
  observaciones: [""],
};

const DEBOUNCE_MS = 400;

function aplicarCamareroFijo(
  form: PostresFormState,
  camareroFijo: string | null | undefined,
): PostresFormState {
  if (!camareroFijo) return form;
  return { ...form, camareroId: camareroFijo };
}

function estadoConCamarero(
  camareroFijo: string | null | undefined,
): PostresFormState {
  if (!camareroFijo) return estadoInicial;
  return { ...estadoInicial, camareroId: camareroFijo };
}

function estadoConMesa(
  mesaInicial: string | null | undefined,
  camareroFijo: string | null | undefined,
): PostresFormState {
  const base = estadoConCamarero(camareroFijo);
  if (mesaInicial) return { ...base, mesa: mesaInicial };
  return base;
}

export function usePostresForm(
  camareroFijo?: string | null,
  mesaInicial?: string | null,
) {
  const [form, setForm] = useState<PostresFormState>(estadoInicial);
  const [step, setStep] = useState<PostresFormStep>("editar");
  const [borradorRecuperado, setBorradorRecuperado] = useState(false);
  const inicializado = useRef(false);

  useEffect(() => {
    if (inicializado.current) return;
    inicializado.current = true;

    const borrador = cargarBorradorPostres();
    if (borrador && borradorPostresTieneDatos(borrador)) {
      setForm(
        aplicarCamareroFijo(
          {
            ...borrador,
            cafes: borrador.cafes?.length
              ? borrador.cafes
              : [crearPostreVacio()],
            estadoXCafe: borrador.estadoXCafe ?? null,
          },
          camareroFijo,
        ),
      );
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
      if (borradorPostresTieneDatos(form)) {
        guardarBorradorPostres(form);
      } else {
        limpiarBorradorPostres();
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [form, step]);

  const setMesa = useCallback((mesa: string) => {
    setForm((prev) => ({ ...prev, mesa }));
  }, []);

  const setCamarero = useCallback((camareroId: string) => {
    setForm((prev) => ({ ...prev, camareroId }));
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

  const addPostre = useCallback((nombre?: string) => {
    setForm((prev) => ({
      ...prev,
      postres: [
        ...prev.postres,
        { ...crearPostreVacio(), nombre: nombre ?? "" },
      ],
    }));
  }, []);

  const addPostreFrecuente = useCallback((producto: ProductoCatalogo) => {
    setForm((prev) => {
      const vacio = prev.postres.find((p) => !p.nombre.trim());
      const datos = { nombre: producto.nombre };
      if (vacio) {
        return {
          ...prev,
          postres: prev.postres.map((p) =>
            p.id === vacio.id ? { ...p, ...datos } : p,
          ),
        };
      }
      return {
        ...prev,
        postres: [...prev.postres, { ...crearPostreVacio(), ...datos }],
      };
    });
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

  const addCafe = useCallback((nombre?: string) => {
    setForm((prev) => ({
      ...prev,
      cafes: [
        ...prev.cafes,
        { ...crearPostreVacio(), nombre: nombre ?? "" },
      ],
    }));
  }, []);

  const addCafeRapido = useCallback((nombre: string) => {
    setForm((prev) => {
      const vacio = prev.cafes.find((c) => !c.nombre.trim());
      const datos = { nombre };
      if (vacio) {
        return {
          ...prev,
          cafes: prev.cafes.map((c) =>
            c.id === vacio.id ? { ...c, ...datos } : c,
          ),
        };
      }
      return {
        ...prev,
        cafes: [...prev.cafes, { ...crearPostreVacio(), ...datos }],
      };
    });
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

  const setEstadoX = useCallback((estado: EstadoPostreX | null) => {
    setForm((prev) => ({
      ...prev,
      estadoX: prev.estadoX === estado ? null : estado,
    }));
  }, []);

  const toggleClH = useCallback(() => {
    setForm((prev) => ({ ...prev, clH: !prev.clH }));
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
    limpiarBorradorPostres();
    setForm(estadoConMesa(mesaInicial, camareroFijo));
    setStep("editar");
    setBorradorRecuperado(false);
  }, [camareroFijo, mesaInicial]);

  const descartarBorrador = useCallback(() => {
    limpiarBorradorPostres();
    setForm(estadoConMesa(mesaInicial, camareroFijo));
    setBorradorRecuperado(false);
  }, [camareroFijo, mesaInicial]);

  const esValido = formPostresEsValido(form);

  return {
    form,
    step,
    setStep,
    setMesa,
    setCamarero,
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
    setEstadoX,
    toggleClH,
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
