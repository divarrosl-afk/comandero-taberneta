import type { Sesion } from "@/types/auth";

export interface AuthRepository {
  login(username: string, password: string): Promise<Sesion | null>;
  logout(): Promise<void>;
  restoreSession(): Promise<Sesion | null>;
}
