import { comandasRepositoryLocal } from "@/lib/comandas/comandas-repository-local";
import { comandasRepositorySupabase } from "@/lib/comandas/comandas-repository-supabase";
import type { ComandasRepository } from "@/lib/comandas/comandas-repository";
import { postresRepositoryLocal } from "@/lib/postres/postres-repository-local";
import { postresRepositorySupabase } from "@/lib/postres/postres-repository-supabase";
import type { PostresRepository } from "@/lib/postres/postres-repository";
import { authRepositoryLocal } from "@/lib/auth/auth-repository-local";
import { authRepositorySupabase } from "@/lib/auth/auth-repository-supabase";
import type { AuthRepository } from "@/lib/auth/auth-repository";
import { usuariosRepositoryLocal } from "@/lib/auth/usuarios-repository-local";
import { usuariosRepositorySupabase } from "@/lib/auth/usuarios-repository-supabase";
import type { UsuariosRepository } from "@/lib/auth/usuarios-repository";
import { catalogoRepositoryLocal } from "@/lib/catalogo/catalogo-repository-local";
import { catalogoRepositorySupabase } from "@/lib/catalogo/catalogo-repository-supabase";
import type { CatalogoRepository } from "@/lib/catalogo/catalogo-repository";
import { menuDiaRepositoryLocal } from "@/lib/menu-dia/menu-dia-repository-local";
import { menuDiaRepositoryApi } from "@/lib/menu-dia/menu-dia-repository-api";
import type { MenuDiaRepository } from "@/lib/menu-dia/menu-dia-repository";
import { mesasRepositoryLocal } from "@/lib/mesas/mesas-repository-local";
import { mesasRepositorySupabase } from "@/lib/mesas/mesas-repository-supabase";
import type { MesasRepository } from "@/lib/mesas/mesas-repository";
import { impresoraConfigRepositoryLocal } from "@/lib/impresora/impresora-config-repository-local";
import { impresoraConfigRepositorySupabase } from "@/lib/impresora/impresora-config-repository-supabase";
import type { ImpresoraConfigRepository } from "@/lib/impresora/impresora-config-repository";
import { getDataBackend, usesRemoteData } from "@/lib/data/backend";
import { isSupabaseEnvConfigured } from "@/lib/supabase/env";

let authRepo: AuthRepository = authRepositoryLocal;
let usuariosRepo: UsuariosRepository = usuariosRepositoryLocal;
let catalogoRepo: CatalogoRepository = catalogoRepositoryLocal;
let menuDiaRepo: MenuDiaRepository = menuDiaRepositoryLocal;
let mesasRepo: MesasRepository = mesasRepositoryLocal;
let impresoraRepo: ImpresoraConfigRepository = impresoraConfigRepositoryLocal;
let comandasRepo: ComandasRepository = comandasRepositoryLocal;
let postresRepo: PostresRepository = postresRepositoryLocal;
let initialized = false;

export function initializeDataLayer(): void {
  if (initialized) return;
  initialized = true;

  if (!usesRemoteData() || !isSupabaseEnvConfigured()) {
    return;
  }

  authRepo = authRepositorySupabase;
  usuariosRepo = usuariosRepositorySupabase;
  catalogoRepo = catalogoRepositorySupabase;
  menuDiaRepo = menuDiaRepositoryApi;
  mesasRepo = mesasRepositorySupabase;
  impresoraRepo = impresoraConfigRepositorySupabase;
  comandasRepo = comandasRepositorySupabase;
  postresRepo = postresRepositorySupabase;
}

export function getAuthRepository(): AuthRepository {
  return authRepo;
}

export function getUsuariosRepository(): UsuariosRepository {
  return usuariosRepo;
}

export function getCatalogoRepository(): CatalogoRepository {
  return catalogoRepo;
}

export function getMenuDiaRepository(): MenuDiaRepository {
  return menuDiaRepo;
}

export function getMesasRepository(): MesasRepository {
  return mesasRepo;
}

export function getImpresoraConfigRepository(): ImpresoraConfigRepository {
  return impresoraRepo;
}

export function getComandasRepository(): ComandasRepository {
  return comandasRepo;
}

export function getPostresRepository(): PostresRepository {
  return postresRepo;
}

export function getActiveBackendLabel(): string {
  const backend = getDataBackend();
  if (backend === "local") return "local";
  if (!isSupabaseEnvConfigured()) return `${backend} (sin configurar)`;
  return backend;
}

/** Solo tests — reinicia el selector de repositorios */
export function resetDataLayerForTests(): void {
  initialized = false;
  authRepo = authRepositoryLocal;
  usuariosRepo = usuariosRepositoryLocal;
  catalogoRepo = catalogoRepositoryLocal;
  menuDiaRepo = menuDiaRepositoryLocal;
  mesasRepo = mesasRepositoryLocal;
  impresoraRepo = impresoraConfigRepositoryLocal;
  comandasRepo = comandasRepositoryLocal;
  postresRepo = postresRepositoryLocal;
}
