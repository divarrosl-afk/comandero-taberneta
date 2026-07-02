import { CAMARERO_EQUIPO } from "@/lib/comanda/camarero-equipo";
import { getMesaCodigo } from "@/lib/mesas/resolve-mesa";
import { postreTieneContenido } from "@/lib/postres/postre-factory";
import { generarIdPostres } from "@/lib/postres/postres-service";
import type { ComandaPostres, PostresFormState } from "@/types/postres";

function mapItems(form: PostresFormState) {
  const map = (items: PostresFormState["postres"]) =>
    items
      .filter(postreTieneContenido)
      .map((p) => ({
        id: p.id,
        nombre: p.nombre.trim(),
        cantidad: p.cantidad,
        nota: p.nota?.trim() || undefined,
      }));

  return { postres: map(form.postres), cafes: map(form.cafes) };
}

export function formToComandaPostres(
  form: PostresFormState,
): ComandaPostres | null {
  if (!form.mesa) return null;

  const { postres, cafes } = mapItems(form);

  return {
    id: generarIdPostres(),
    mesa: form.mesa,
    mesaCodigo: getMesaCodigo(form.mesa),
    camarero: CAMARERO_EQUIPO,
    postres,
    cafes,
    estadoX: form.estadoX,
    estadoXCafe: form.estadoXCafe,
    clH: false,
    observaciones: form.observaciones.map((o) => o.trim()).filter(Boolean),
    creadaEn: new Date().toISOString(),
    enviada: true,
    estadoPanel: "sentados",
  };
}

export function formTienePostres(form: PostresFormState): boolean {
  return form.postres.some(postreTieneContenido);
}

export function formTieneCafes(form: PostresFormState): boolean {
  return form.cafes.some(postreTieneContenido);
}

export function formPostresEsValido(form: PostresFormState): boolean {
  return (
    form.mesa !== null &&
    (formTienePostres(form) ||
      formTieneCafes(form) ||
      form.estadoX !== null ||
      form.estadoXCafe !== null)
  );
}
