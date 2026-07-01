import {
  getImpresoraConfig,
  guardarImpresoraConfig,
  resetImpresoraConfig,
} from "@/lib/storage/impresora-config";
import { IMPRESORA_DEFAULT } from "@/types/impresora";
import type { ImpresoraConfigRepository } from "@/lib/impresora/impresora-config-repository";

export const impresoraConfigRepositoryLocal: ImpresoraConfigRepository = {
  get: async () => getImpresoraConfig(),
  save: async (config) => {
    guardarImpresoraConfig(config);
  },
  reset: async () => {
    resetImpresoraConfig();
    return IMPRESORA_DEFAULT;
  },
};
