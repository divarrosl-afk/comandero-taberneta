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
  estadoX: null,
  clH: false,
  observaciones: [""],
};

const DEBOUNCE_MS = 400;

export function usePostresForm() {
  const [form, setForm] = useState<PostresFormState>(estadoInicial);
  const [step, setStep] = useState<PostresFormStep>("editar");
  const [borradorRecuperado, setBorradorRecuperado] = useState(false);
  const inicializado = useRef(false);

  useEffect(() => {
    if (inicializado.current) return;
    inicializado.current = true;

    const borrador = cargarBorradorPostres();
    if (borrador && borradorPostresTieneDatos(borrador)) {
      setForm(borrador);
      setBorradorRecuperado(true);
    }
  }, []);

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

  const setMesa = useCallback((mesa: number) => {
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

  const addPostreFrecuente = useCallback((nombre: string) => {
    setForm((prev) => {
      const vacio = prev.postres.find((p) => !p.nombre.trim());
      if (vacio) {
        return {
          ...prev,
          postres: prev.postres.map((p) =>
            p.id === vacio.id ? { ...p, nombre } : p,
          ),
        };
      }
      return {
        ...prev,
        postres: [...prev.postres, { ...crearPostreVacio(), nombre }],
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
    setForm(estadoInicial);
    setStep("editar");
    setBorradorRecuperado(false);
  }, []);

  const descartarBorrador = useCallback(() => {
    limpiarBorradorPostres();
    setForm(estadoInicial);
    setBorradorRecuperado(false);
  }, []);

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
