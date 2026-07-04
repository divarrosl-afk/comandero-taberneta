import { generateUuidV4 } from "@/lib/id/uuid";

let fallbackCounter = 0;

function fallbackId(): string {
  fallbackCounter += 1;
  return generateUuidV4();
}

/** ID único compatible con cliente móvil, SSR y entornos sin crypto.randomUUID. */
export function createId(prefix?: string): string {
  const randomUUID = globalThis.crypto?.randomUUID;
  const id =
    typeof randomUUID === "function" ? randomUUID.call(globalThis.crypto) : fallbackId();
  return prefix ? `${prefix}_${id}` : id;
}
