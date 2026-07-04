/** Evento global cuando operativa, mesas o menú se refrescan desde Supabase. */
export const APP_SYNC_EVENT = "comandero:app-sync";

export function dispatchAppSync(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(APP_SYNC_EVENT));
}
