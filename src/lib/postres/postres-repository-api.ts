import { usesRemoteData } from "@/lib/data/backend";
import { getSupabaseAccessToken } from "@/lib/supabase/client";
import type { PostresRepository } from "@/lib/postres/postres-repository";
import { postresRepositoryLocal } from "@/lib/postres/postres-repository-local";
import type { ComandaPostres } from "@/types/postres";
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

export const postresRepositoryApi: PostresRepository = {
  async getAll() {
    if (!usesRemoteData()) return postresRepositoryLocal.getAll();

    const headers = await authHeaders();
    const res = await fetch("/api/operativa/postres", {
      headers,
      cache: "no-store",
    });
    if (!res.ok) throw new Error(await parseError(res));
    const data = (await res.json()) as { comandas?: ComandaPostres[] };
    return data.comandas ?? [];
  },

  async getById(id) {
    const todas = await this.getAll();
    return todas.find((c) => c.id === id);
  },

  async crear(comanda, meta?: ComandaPersistMeta) {
    if (!usesRemoteData()) return postresRepositoryLocal.crear(comanda, meta);

    const headers = await authHeaders();
    const res = await fetch("/api/operativa/postres", {
      method: "POST",
      headers,
      body: JSON.stringify({ comanda, meta }),
    });
    if (!res.ok) throw new Error(await parseError(res));
    const data = (await res.json()) as { comanda: ComandaPostres };
    return data.comanda;
  },

  async actualizar(id, cambios) {
    if (!usesRemoteData()) return postresRepositoryLocal.actualizar(id, cambios);

    const headers = await authHeaders();
    const res = await fetch(`/api/operativa/postres/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(cambios),
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(await parseError(res));
    const data = (await res.json()) as { comanda: ComandaPostres };
    return data.comanda;
  },

  async actualizarEstado(id, estado: EstadoPanel) {
    if (!usesRemoteData()) {
      return postresRepositoryLocal.actualizarEstado(id, estado);
    }

    const headers = await authHeaders();
    const res = await fetch(`/api/operativa/postres/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ estadoPanel: estado }),
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(await parseError(res));
    const data = (await res.json()) as { comanda: ComandaPostres };
    return data.comanda;
  },

  async eliminar(id) {
    if (!usesRemoteData()) return postresRepositoryLocal.eliminar(id);

    const headers = await authHeaders();
    const res = await fetch(`/api/operativa/postres/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers,
    });
    if (!res.ok) throw new Error(await parseError(res));
    return true;
  },

  async eliminarDelDia(fecha) {
    if (!usesRemoteData()) return postresRepositoryLocal.eliminarDelDia(fecha);

    const headers = await authHeaders();
    const res = await fetch("/api/operativa/postres/borrar-dia", {
      method: "POST",
      headers,
      body: JSON.stringify({ fecha }),
    });
    if (!res.ok) throw new Error(await parseError(res));
    const data = (await res.json()) as { eliminadas?: number };
    return data.eliminadas ?? 0;
  },
};
