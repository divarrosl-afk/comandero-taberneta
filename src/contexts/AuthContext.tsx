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
import { autenticarUsuario } from "@/lib/auth/credentials";
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
import { getSesion, guardarSesion, limpiarSesion } from "@/lib/storage/sesion";
import type { Sesion } from "@/types/auth";

interface AuthContextValue {
  sesion: Sesion | null;
  listo: boolean;
  iniciarSesion: (username: string, password: string) => boolean;
  cerrarSesion: () => void;
  puedeConfigCatalogo: boolean;
  puedeConfigCarta: boolean;
  puedeConfigMenuDia: boolean;
  puedeCierre: boolean;
  puedeAdminUsuarios: boolean;
  puedeConfigMesas: boolean;
  puedeConfigImpresora: boolean;
  puedeBorrarHistorial: boolean;
  puedeCambiarCamarero: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<Sesion | null>(null);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    setSesion(getSesion());
    setListo(true);
  }, []);

  const iniciarSesion = useCallback((username: string, password: string) => {
    const nueva = autenticarUsuario(username, password);
    if (!nueva) return false;

    guardarSesion(nueva);
    setSesion(nueva);
    return true;
  }, []);

  const cerrarSesion = useCallback(() => {
    limpiarSesion();
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
    }),
    [sesion, listo, iniciarSesion, cerrarSesion],
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
