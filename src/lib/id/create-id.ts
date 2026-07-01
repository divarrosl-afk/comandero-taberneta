let fallbackCounter = 0;

function fallbackId(): string {
  fallbackCounter += 1;
  const ts = Date.now().toString(36);
  const rnd = Math.random().toString(36).slice(2, 11);
  const cnt = fallbackCounter.toString(36);
  return `${ts}-${rnd}-${cnt}`;
}

/** ID único compatible con cliente móvil, SSR y entornos sin crypto.randomUUID. */
export function createId(prefix?: string): string {
  const randomUUID = globalThis.crypto?.randomUUID;
  const id =
    typeof randomUUID === "function" ? randomUUID.call(globalThis.crypto) : fallbackId();
  return prefix ? `${prefix}_${id}` : id;
}
