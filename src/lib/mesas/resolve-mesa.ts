import { getMesasConfig } from "@/lib/storage/mesas";
import type { MesaConfig } from "@/types/mesas";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

export function findMesaConfig(ref: string | null | undefined): MesaConfig | undefined {
  if (!ref) return undefined;
  const norm = ref.trim();
  if (!norm) return undefined;
  const upper = norm.toUpperCase();
  return getMesasConfig().find(
    (m) =>
      m.id === norm ||
      m.codigo === norm ||
      m.codigo === upper,
  );
}

/** Nombre visible para pantalla e impresión a partir de id, código o UUID. */
export function getNombreMesa(ref: string | null): string {
  if (!ref) return "—";
  const mesa = findMesaConfig(ref);
  if (mesa?.nombreVisible) return mesa.nombreVisible;
  if (isUuid(ref)) return ref.slice(0, 8);
  return ref;
}

export function getMesaCodigo(ref: string | null): string | undefined {
  if (!ref) return undefined;
  const mesa = findMesaConfig(ref);
  return mesa?.codigo ?? (isUuid(ref) ? undefined : ref.trim().toUpperCase());
}

export interface MesaComandaRef {
  mesa: string;
  mesaCodigo?: string;
}

/** Resuelve el nombre de mesa para una comanda (id UUID + código en BD). */
export function getNombreMesaComanda(comanda: MesaComandaRef): string {
  const porId = getNombreMesa(comanda.mesa);
  if (!isUuid(porId)) return porId;

  if (comanda.mesaCodigo) {
    const porCodigo = getNombreMesa(comanda.mesaCodigo);
    if (!isUuid(porCodigo)) return porCodigo;
    return comanda.mesaCodigo;
  }

  const codigo = getMesaCodigo(comanda.mesa);
  if (codigo) {
    const porCodigo = getNombreMesa(codigo);
    if (!isUuid(porCodigo)) return porCodigo;
    return codigo;
  }

  return porId;
}

export function comandaPerteneceAMesa(
  comanda: MesaComandaRef,
  mesaId: string,
): boolean {
  if (comanda.mesa === mesaId) return true;
  const mesa = findMesaConfig(mesaId);
  if (!mesa) return false;
  return (
    comanda.mesa === mesa.id ||
    comanda.mesa === mesa.codigo ||
    comanda.mesaCodigo === mesa.codigo
  );
}
