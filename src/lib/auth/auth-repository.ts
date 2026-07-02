import type { Sesion } from "@/types/auth";

export type LoginError = "credentials" | "no_perfil" | "inactive";

export interface LoginResult {
  sesion: Sesion | null;
  error?: LoginError;
}

export interface AuthRepository {
  login(username: string, password: string): Promise<LoginResult>;
  logout(): Promise<void>;
  restoreSession(): Promise<Sesion | null>;
}
