import { getCamareroNombre } from "@/data/camareros";
import { postreTieneContenido } from "@/lib/postres/postre-factory";
import type { ComandaPostres, PostresFormState } from "@/types/postres";

export function generarIdPostres(): string {
  return `pst-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function formToComandaPostres(
  form: PostresFormState,
): ComandaPostres | null {
  const camarero = getCamareroNombre(form.camareroId);
  if (!form.mesa || !camarero) return null;

  return {
    id: generarIdPostres(),
    mesa: form.mesa,
    camarero,
    postres: form.postres
      .filter(postreTieneContenido)
      .map((p) => ({
        id: p.id,
        nombre: p.nombre.trim(),
        cantidad: p.cantidad,
        nota: p.nota?.trim() || undefined,
      })),
    estadoX: form.estadoX,
    clH: form.clH,
    observaciones: form.observaciones.map((o) => o.trim()).filter(Boolean),
    creadaEn: new Date().toISOString(),
    enviada: true,
    estadoPanel: "pendiente",
  };
}

export function formTienePostres(form: PostresFormState): boolean {
  return form.postres.some(postreTieneContenido);
}

export function formPostresEsValido(form: PostresFormState): boolean {
  return (
    form.mesa !== null &&
    form.camareroId !== null &&
    (formTienePostres(form) || form.estadoX !== null || form.clH)
  );
}
