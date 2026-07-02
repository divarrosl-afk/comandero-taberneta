import { crearMesasDefault } from "@/data/mesas-default";
import { getNombreMesa as resolveNombreMesa } from "@/lib/mesas/resolve-mesa";
import { codigoVarianteB, type MesaConfig } from "@/types/mesas";

const STORAGE_KEY = "comandero-taberneta:mesas";

function normalizar(mesa: MesaConfig): MesaConfig {
  const codigo = mesa.codigo.trim().toUpperCase();
  return {
    ...mesa,
    id: mesa.id || codigo,
    codigo,
    nombreVisible: mesa.nombreVisible?.trim() || codigo,
    activa: mesa.activa ?? true,
    orden: mesa.orden ?? 0,
    permiteVarianteB: mesa.permiteVarianteB ?? false,
    esVarianteB: mesa.esVarianteB ?? false,
  };
}

function migrar(raw: Partial<MesaConfig>): MesaConfig {
  return normalizar({
    id: raw.id ?? raw.codigo ?? "",
    codigo: raw.codigo ?? raw.id ?? "",
    nombreVisible: raw.nombreVisible ?? raw.codigo ?? "",
    zona: raw.zona ?? "comedor",
    activa: raw.activa ?? true,
    orden: raw.orden ?? 0,
    permiteVarianteB: raw.permiteVarianteB ?? false,
    esVarianteB: raw.esVarianteB ?? false,
    mesaPrincipalId: raw.mesaPrincipalId,
  });
}

export function getMesasConfig(): MesaConfig[] {
  if (typeof window === "undefined") return crearMesasDefault();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const defaults = crearMesasDefault();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
      return defaults;
    }
    const parsed = JSON.parse(raw) as Partial<MesaConfig>[];
    return Array.isArray(parsed)
      ? parsed.map((m) => migrar(m))
      : crearMesasDefault();
  } catch {
    return crearMesasDefault();
  }
}

export function guardarMesasConfig(mesas: MesaConfig[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mesas.map(normalizar)));
}

export function getMesaConfig(id: string): MesaConfig | undefined {
  const norm = id.trim();
  const upper = norm.toUpperCase();
  return getMesasConfig().find(
    (m) => m.id === norm || m.codigo === norm || m.codigo === upper,
  );
}

export function getMesasActivas(): MesaConfig[] {
  return getMesasConfig()
    .filter((m) => m.activa)
    .sort((a, b) => a.orden - b.orden || a.codigo.localeCompare(b.codigo, "es"));
}

export function getMesasPorZona(zona: MesaConfig["zona"]): MesaConfig[] {
  return getMesasActivas().filter((m) => m.zona === zona);
}

export function crearMesaConfig(mesa: MesaConfig): MesaConfig {
  const n = normalizar(mesa);
  if (getMesaConfig(n.id)) {
    throw new Error("Ya existe una mesa con ese código");
  }
  guardarMesasConfig([...getMesasConfig(), n]);
  return n;
}

export function actualizarMesaConfig(
  id: string,
  cambios: Partial<MesaConfig>,
): MesaConfig | null {
  const mesas = getMesasConfig();
  const index = mesas.findIndex((m) => m.id === id);
  if (index === -1) return null;

  const actualizada = normalizar({ ...mesas[index], ...cambios, id });
  mesas[index] = actualizada;

  if (cambios.permiteVarianteB !== undefined && actualizada.zona === "rambla") {
    sincronizarVarianteB(mesas, actualizada);
  }

  guardarMesasConfig(mesas);
  return actualizada;
}

function sincronizarVarianteB(mesas: MesaConfig[], principal: MesaConfig): void {
  const codigoB = codigoVarianteB(principal.codigo);
  const idx = mesas.findIndex((m) => m.id === codigoB);

  if (principal.permiteVarianteB) {
    if (idx === -1) {
      mesas.push(
        normalizar({
          id: codigoB,
          codigo: codigoB,
          nombreVisible: codigoB,
          zona: "rambla",
          activa: true,
          orden: principal.orden + 0.5,
          permiteVarianteB: false,
          esVarianteB: true,
          mesaPrincipalId: principal.id,
        }),
      );
    } else {
      mesas[idx] = { ...mesas[idx], activa: true, mesaPrincipalId: principal.id };
    }
  } else if (idx !== -1) {
    mesas[idx] = { ...mesas[idx], activa: false };
  }
}

export function resetMesasConfig(): MesaConfig[] {
  const defaults = crearMesasDefault();
  guardarMesasConfig(defaults);
  return defaults;
}

export function getNombreMesa(id: string | null): string {
  return resolveNombreMesa(id);
}
