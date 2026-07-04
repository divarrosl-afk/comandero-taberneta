import { usesRemoteData } from "@/lib/data/backend";
import { getSupabaseAccessToken } from "@/lib/supabase/client";
import type { ComandasRepository } from "@/lib/comandas/comandas-repository";
import { comandasRepositoryLocal } from "@/lib/comandas/comandas-repository-local";
import type { ComandaCocina } from "@/types/comanda";
import type { EstadoPanel } from "@/types/panel";
import type { ComandaPersistMeta } from "@/lib/supabase/comandas-mappers";

async function authHeaders(): Promise<HeadersInit> {
  const token = await getSupabaseAccessToken();
  if (!token) throw new Error("Sesión requerida");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function parseError(res: Response): Promise<string> {
  const body = (await res.json().catch(() => ({}))) as { error?: string };
  return body.error ?? `Error HTTP ${res.status}`;
}

export const comandasRepositoryApi: ComandasRepository = {
  async getAll() {
    if (!usesRemoteData()) return comandasRepositoryLocal.getAll();

    const headers = await authHeaders();
    const res = await fetch("/api/operativa/cocina", {
      headers,
      cache: "no-store",
    });
    if (!res.ok) throw new Error(await parseError(res));
    const data = (await res.json()) as { comandas?: ComandaCocina[] };
    return data.comandas ?? [];
  },

  async getById(id) {
    const todas = await this.getAll();
    return todas.find((c) => c.id === id);
  },

  async crear(comanda, meta?: ComandaPersistMeta) {
    if (!usesRemoteData()) return comandasRepositoryLocal.crear(comanda, meta);

    const headers = await authHeaders();
    const res = await fetch("/api/operativa/cocina", {
      method: "POST",
      headers,
      body: JSON.stringify({ comanda, meta }),
    });
    if (!res.ok) throw new Error(await parseError(res));
    const data = (await res.json()) as { comanda: ComandaCocina };
    return data.comanda;
  },

  async actualizar(id, cambios) {
    if (!usesRemoteData()) return comandasRepositoryLocal.actualizar(id, cambios);

    const headers = await authHeaders();
    const res = await fetch(`/api/operativa/cocina/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(cambios),
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(await parseError(res));
    const data = (await res.json()) as { comanda: ComandaCocina };
    return data.comanda;
  },

  async actualizarEstado(id, estado: EstadoPanel) {
    if (!usesRemoteData()) {
      return comandasRepositoryLocal.actualizarEstado(id, estado);
    }

    const headers = await authHeaders();
    const res = await fetch(`/api/operativa/cocina/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ estadoPanel: estado }),
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(await parseError(res));
    const data = (await res.json()) as { comanda: ComandaCocina };
    return data.comanda;
  },

  async eliminar(id) {
    if (!usesRemoteData()) return comandasRepositoryLocal.eliminar(id);

    const headers = await authHeaders();
    const res = await fetch(`/api/operativa/cocina/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers,
    });
    if (!res.ok) throw new Error(await parseError(res));
    return true;
  },

  async eliminarDelDia(fecha) {
    if (!usesRemoteData()) return comandasRepositoryLocal.eliminarDelDia(fecha);

    const headers = await authHeaders();
    const res = await fetch("/api/operativa/cocina/borrar-dia", {
      method: "POST",
      headers,
      body: JSON.stringify({ fecha }),
    });
    if (!res.ok) throw new Error(await parseError(res));
    const data = (await res.json()) as { eliminadas?: number };
    return data.eliminadas ?? 0;
  },
};
