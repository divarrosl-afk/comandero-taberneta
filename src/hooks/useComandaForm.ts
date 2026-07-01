"use client";

import { useCallback, useState } from "react";
import type { ComandaFormState, ComandaFormStep, PlatoFormItem } from "@/types/comanda";

function crearPlatoVacio(): PlatoFormItem {
  return {
    id: crypto.randomUUID(),
    nombre: "",
    cantidad: 1,
  };
}

const estadoInicial: ComandaFormState = {
  mesa: null,
  camareroId: null,
  entrantes: [crearPlatoVacio()],
  primeros: [crearPlatoVacio()],
  segundos: [crearPlatoVacio()],
  bebidas: [crearPlatoVacio()],
  observaciones: [""],
};

export function useComandaForm() {
  const [form, setForm] = useState<ComandaFormState>(estadoInicial);
  const [step, setStep] = useState<ComandaFormStep>("editar");

  const setMesa = useCallback((mesa: number) => {
    setForm((prev) => ({ ...prev, mesa }));
  }, []);

  const setCamarero = useCallback((camareroId: string) => {
    setForm((prev) => ({ ...prev, camareroId }));
  }, []);

  const updatePlato = useCallback(
    (
      seccion: "entrantes" | "primeros" | "segundos" | "bebidas",
      id: string,
      cambios: Partial<PlatoFormItem>,
    ) => {
      setForm((prev) => ({
        ...prev,
        [seccion]: prev[seccion].map((p) =>
          p.id === id ? { ...p, ...cambios } : p,
        ),
      }));
    },
    [],
  );

  const addPlato = useCallback(
    (seccion: "entrantes" | "primeros" | "segundos" | "bebidas") => {
      setForm((prev) => ({
        ...prev,
        [seccion]: [...prev[seccion], crearPlatoVacio()],
      }));
    },
    [],
  );

  const removePlato = useCallback(
    (
      seccion: "entrantes" | "primeros" | "segundos" | "bebidas",
      id: string,
    ) => {
      setForm((prev) => {
        const lista = prev[seccion].filter((p) => p.id !== id);
        return {
          ...prev,
          [seccion]: lista.length ? lista : [crearPlatoVacio()],
        };
      });
    },
    [],
  );

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

  const reset = useCallback(() => {
    setForm(estadoInicial);
    setStep("editar");
  }, []);

  const puedePrevisualizar =
    form.mesa !== null &&
    form.camareroId !== null &&
    [...form.entrantes, ...form.primeros, ...form.segundos, ...form.bebidas].some(
      (p) => p.nombre.trim().length > 0,
    );

  return {
    form,
    step,
    setStep,
    setMesa,
    setCamarero,
    updatePlato,
    addPlato,
    removePlato,
    setObservacion,
    addObservacion,
    removeObservacion,
    reset,
    puedePrevisualizar,
  };
}
