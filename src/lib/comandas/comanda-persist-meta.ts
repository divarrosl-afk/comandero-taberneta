import { getMesasRepository } from "@/lib/mesas/mesas-service";
import { getMesaConfig } from "@/lib/storage/mesas";
import type { ComandaPersistMeta } from "@/lib/supabase/comandas-mappers";

export async function buildComandaPersistMeta(
  mesaRef: string,
  camareroUsername?: string | null,
): Promise<ComandaPersistMeta> {
  try {
    const mesa = await getMesasRepository().getById(mesaRef);
    if (mesa) {
      return {
        mesaId: mesa.id,
        mesaCodigo: mesa.codigo,
        camareroUsername: camareroUsername ?? null,
      };
    }
  } catch {
    // offline — fallback caché local de mesas
  }

  const cached = getMesaConfig(mesaRef);
  return {
    mesaId: cached?.id ?? mesaRef,
    mesaCodigo: cached?.codigo ?? mesaRef.trim().toUpperCase(),
    camareroUsername: camareroUsername ?? null,
  };
}
