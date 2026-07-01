import type { ComandaCocina } from "@/types/comanda";
import type { EstadoPanel } from "@/types/panel";
import type { ComandaPersistMeta } from "@/lib/supabase/comandas-mappers";

export interface ComandasRepository {
  getAll(): Promise<ComandaCocina[]>;
  getById(id: string): Promise<ComandaCocina | undefined>;
  crear(
    comanda: ComandaCocina,
    meta?: ComandaPersistMeta,
  ): Promise<ComandaCocina>;
  actualizar(
    id: string,
    cambios: Partial<ComandaCocina>,
  ): Promise<ComandaCocina | null>;
  actualizarEstado(
    id: string,
    estado: EstadoPanel,
  ): Promise<ComandaCocina | null>;
  eliminar(id: string): Promise<boolean>;
  eliminarDelDia(fecha: string): Promise<number>;
}
