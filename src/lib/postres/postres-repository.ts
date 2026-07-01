import type { ComandaPostres } from "@/types/postres";
import type { EstadoPanel } from "@/types/panel";
import type { ComandaPersistMeta } from "@/lib/supabase/comandas-mappers";

export interface PostresRepository {
  getAll(): Promise<ComandaPostres[]>;
  getById(id: string): Promise<ComandaPostres | undefined>;
  crear(
    comanda: ComandaPostres,
    meta?: ComandaPersistMeta,
  ): Promise<ComandaPostres>;
  actualizar(
    id: string,
    cambios: Partial<ComandaPostres>,
  ): Promise<ComandaPostres | null>;
  actualizarEstado(
    id: string,
    estado: EstadoPanel,
  ): Promise<ComandaPostres | null>;
  eliminar(id: string): Promise<boolean>;
  eliminarDelDia(fecha: string): Promise<number>;
}
