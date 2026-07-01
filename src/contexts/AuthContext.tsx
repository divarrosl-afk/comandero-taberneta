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
import type { Sesion } from "@/types/auth";

interface AuthContextValue {
  sesion: Sesion | null;
  listo: boolean;
  iniciarSesion: (username: string, password: string) => Promise<boolean>;
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<Sesion | null>(null);
  const [listo, setListo] = useState(false);
  const usaSupabase = usesRemoteData();

  useEffect(() => {
    let activo = true;

    void (async () => {
      const restaurada = await getAuthRepository().restoreSession();
      if (activo) {
        setSesion(restaurada);
        setListo(true);
      }
    })();

    return () => {
      activo = false;
    };
  }, []);

  const iniciarSesion = useCallback(async (username: string, password: string) => {
    const nueva = await getAuthRepository().login(username, password);
    if (!nueva) return false;

    setSesion(nueva);
    return true;
  }, []);

  const cerrarSesion = useCallback(async () => {
    await getAuthRepository().logout();
    setSesion(null);
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
