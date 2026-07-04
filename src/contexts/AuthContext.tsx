"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  puedeAccederConfigCatalogo,
  puedeAccederConfigCarta,
  puedeAccederConfigImpresora,
  puedeAccederConfigMenuDia,
  puedeAccederCierre,
  puedeAdministrarUsuarios,
  puedeConfigurarMesas,
  puedeBorrarHistorial,
  puedeCambiarCamarero,
} from "@/lib/auth/permisos";
import { getAuthRepository } from "@/lib/data/data-layer";
import { usesRemoteData } from "@/lib/data/backend";
import { dispatchAppSync } from "@/lib/sync/app-sync";
import {
  fetchOperativaData,
  resetOperativaInflight,
} from "@/lib/sync/operativa-fetch";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { LoginError, LoginResult } from "@/lib/auth/auth-repository";
import type { Sesion } from "@/types/auth";

interface AuthContextValue {
  sesion: Sesion | null;
  listo: boolean;
  iniciarSesion: (username: string, password: string) => Promise<LoginResult>;
  cerrarSesion: () => Promise<void>;
  puedeConfigCatalogo: boolean;
  puedeConfigCarta: boolean;
  puedeConfigMenuDia: boolean;
  puedeCierre: boolean;
  puedeAdminUsuarios: boolean;
  puedeConfigMesas: boolean;
  puedeConfigImpresora: boolean;
  puedeBorrarHistorial: boolean;
  puedeCambiarCamarero: boolean;
  usaSupabase: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function refrescarOperativaTrasAuth(): Promise<void> {
  if (!usesRemoteData()) return;
  resetOperativaInflight();
  try {
    await fetchOperativaData();
  } catch (e) {
    console.error("[auth] Error al cargar operativa:", e);
  }
  dispatchAppSync();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<Sesion | null>(null);
  const [listo, setListo] = useState(false);
  const usaSupabase = usesRemoteData();

  useEffect(() => {
    let activo = true;

    void (async () => {
      const restaurada = await getAuthRepository().restoreSession();
      if (!activo) return;
      setSesion(restaurada);
      setListo(true);
      if (restaurada) {
        await refrescarOperativaTrasAuth();
      }
    })();

    return () => {
      activo = false;
    };
  }, []);

  useEffect(() => {
    if (!usesRemoteData()) return;

    const client = getSupabaseClient();
    if (!client) return;

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      if (session) {
        void refrescarOperativaTrasAuth();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const iniciarSesion = useCallback(async (username: string, password: string) => {
    const result = await getAuthRepository().login(username, password);
    if (!result.sesion) return result;

    setSesion(result.sesion);
    await refrescarOperativaTrasAuth();
    return result;
  }, []);

  const cerrarSesion = useCallback(async () => {
    await getAuthRepository().logout();
    setSesion(null);
    resetOperativaInflight();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      sesion,
      listo,
      iniciarSesion,
      cerrarSesion,
      puedeConfigCatalogo: sesion
        ? puedeAccederConfigCatalogo(sesion.rol)
        : false,
      puedeConfigCarta: sesion ? puedeAccederConfigCarta(sesion.rol) : false,
      puedeConfigMenuDia: sesion
        ? puedeAccederConfigMenuDia(sesion.rol)
        : false,
      puedeCierre: sesion ? puedeAccederCierre(sesion.rol) : false,
      puedeAdminUsuarios: sesion
        ? puedeAdministrarUsuarios(sesion.rol)
        : false,
      puedeConfigMesas: sesion ? puedeConfigurarMesas(sesion.rol) : false,
      puedeConfigImpresora: sesion
        ? puedeAccederConfigImpresora(sesion.rol)
        : false,
      puedeBorrarHistorial: sesion ? puedeBorrarHistorial(sesion.rol) : false,
      puedeCambiarCamarero: sesion ? puedeCambiarCamarero(sesion.rol) : false,
      usaSupabase,
    }),
    [sesion, listo, iniciarSesion, cerrarSesion, usaSupabase],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return ctx;
}
