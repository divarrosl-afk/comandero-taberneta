import type { ComandaCocina } from "@/types/comanda";
import type { ComandaPostres } from "@/types/postres";

let cacheCocina: ComandaCocina[] = [];
let cachePostres: ComandaPostres[] = [];

export function setComandasCache(comandas: ComandaCocina[]): void {
  cacheCocina = comandas;
}

export function setPostresCache(postres: ComandaPostres[]): void {
  cachePostres = postres;
}

export function getComandasCache(): ComandaCocina[] {
  return cacheCocina;
}

export function getPostresCache(): ComandaPostres[] {
  return cachePostres;
}

export function clearOperativaCache(): void {
  cacheCocina = [];
  cachePostres = [];
}
