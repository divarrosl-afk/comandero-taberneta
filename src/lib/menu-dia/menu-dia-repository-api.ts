import { usesRemoteData } from "@/lib/data/backend";
import { getSupabaseAccessToken } from "@/lib/supabase/client";
import {
  getMenuDia as getMenuDiaLocal,
  guardarMenuDia as guardarMenuDiaLocal,
} from "@/lib/storage/menu-dia";
import type { MenuDiaRepository } from "@/lib/menu-dia/menu-dia-repository";
import { MENU_DIA_DEFAULT, type MenuDiaConfig } from "@/types/menu-dia";

async function authHeaders(): Promise<HeadersInit> {
  const token = await getSupabaseAccessToken();
  if (!token) throw new Error("Sesión requerida");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export const menuDiaRepositoryApi: MenuDiaRepository = {
  async get() {
    if (!usesRemoteData()) return getMenuDiaLocal();

    try {
      const headers = await authHeaders();
      const res = await fetch("/api/menu-dia", {
        headers,
        cache: "no-store",
      });
      if (!res.ok) return getMenuDiaLocal();
      const data = (await res.json()) as { menu?: MenuDiaConfig };
      return data.menu ?? getMenuDiaLocal();
    } catch {
      return getMenuDiaLocal();
    }
  },

  async save(config) {
    guardarMenuDiaLocal(config);
    if (!usesRemoteData()) return;

    const headers = await authHeaders();
    const res = await fetch("/api/menu-dia", {
      method: "PUT",
      headers,
      body: JSON.stringify(config),
    });

    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      throw new Error(body.error ?? "Error al guardar menú en servidor");
    }

    const data = (await res.json()) as { menu?: MenuDiaConfig };
    if (data.menu) guardarMenuDiaLocal(data.menu);
  },

  async resetDefault() {
    if (!usesRemoteData()) {
      guardarMenuDiaLocal(MENU_DIA_DEFAULT);
      return MENU_DIA_DEFAULT;
    }

    try {
      const headers = await authHeaders();
      const res = await fetch("/api/menu-dia", {
        method: "DELETE",
        headers,
      });
      if (!res.ok) throw new Error("DELETE failed");
      const data = (await res.json()) as { menu?: MenuDiaConfig };
      const config = data.menu ?? MENU_DIA_DEFAULT;
      guardarMenuDiaLocal(config);
      return config;
    } catch {
      guardarMenuDiaLocal(MENU_DIA_DEFAULT);
      return MENU_DIA_DEFAULT;
    }
  },
};
