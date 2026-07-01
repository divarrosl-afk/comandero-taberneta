import { getMesasRepository } from "@/lib/mesas/mesas-service";
import type { ComandaPersistMeta } from "@/lib/supabase/comandas-mappers";

export async function buildComandaPersistMeta(
  mesaRef: string,
  camareroUsername?: string | null,
): Promise<ComandaPersistMeta> {
  const mesa = await getMesasRepository().getById(mesaRef);
  return {
    mesaId: mesa?.id ?? mesaRef,
    mesaCodigo: mesa?.codigo ?? mesaRef.trim().toUpperCase(),
    camareroUsername: camareroUsername ?? null,
  };
}
