import { CAMARERO_EQUIPO } from "@/lib/comanda/camarero-equipo";
import { postreTieneContenido } from "@/lib/postres/postre-factory";
import { generarIdPostres } from "@/lib/postres/postres-service";
import type { ComandaPostres, PostresFormState } from "@/types/postres";

export function formToComandaPostres(
  form: PostresFormState,
): ComandaPostres | null {
  if (!form.mesa) return null;

  return {
    id: generarIdPostres(),
    mesa: form.mesa,
    camarero: CAMARERO_EQUIPO,
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
    (formTienePostres(form) || form.estadoX !== null || form.clH)
  );
}
