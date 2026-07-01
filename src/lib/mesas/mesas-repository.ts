import type { MesaConfig } from "@/types/mesas";

/** Capa de acceso a configuración de mesas */
export interface MesasRepository {
  getConfig(): Promise<MesaConfig[]>;
  getById(id: string): Promise<MesaConfig | undefined>;
  guardarConfig(mesas: MesaConfig[]): Promise<void>;
  crear(mesa: MesaConfig): Promise<MesaConfig>;
  actualizar(id: string, cambios: Partial<MesaConfig>): Promise<MesaConfig | null>;
  restaurarDefault(): Promise<MesaConfig[]>;
}
