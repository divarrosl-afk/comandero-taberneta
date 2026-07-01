import { getImpresoraConfigRepository } from "@/lib/data/data-layer";
import {
  getImpresoraConfig as getImpresoraConfigLocal,
  guardarImpresoraConfig as guardarImpresoraConfigLocal,
} from "@/lib/storage/impresora-config";
import type { ImpresoraConfig } from "@/types/impresora";

export async function getImpresoraConfig(): Promise<ImpresoraConfig> {
  const config = await getImpresoraConfigRepository().get();
  guardarImpresoraConfigLocal(config);
  return config;
}

export async function guardarImpresoraConfig(
  config: ImpresoraConfig,
): Promise<void> {
  guardarImpresoraConfigLocal(config);
  await getImpresoraConfigRepository().save(config);
}

export async function resetImpresoraConfig(): Promise<ImpresoraConfig> {
  const config = await getImpresoraConfigRepository().reset();
  guardarImpresoraConfigLocal(config);
  return config;
}
