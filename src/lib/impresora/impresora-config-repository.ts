import type { ImpresoraConfig } from "@/types/impresora";

export interface ImpresoraConfigRepository {
  get(): Promise<ImpresoraConfig>;
  save(config: ImpresoraConfig): Promise<void>;
  reset(): Promise<ImpresoraConfig>;
}
