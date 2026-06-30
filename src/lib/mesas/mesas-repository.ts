import type { MesaConfig } from "@/types/mesas";

/** Capa de acceso a configuración de mesas — sustituir por Supabase */
export interface MesasRepository {
  getConfig(): MesaConfig[];
  getById(id: string): MesaConfig | undefined;
  guardarConfig(mesas: MesaConfig[]): void;
  crear(mesa: MesaConfig): MesaConfig;
  actualizar(id: string, cambios: Partial<MesaConfig>): MesaConfig | null;
  restaurarDefault(): MesaConfig[];
}
