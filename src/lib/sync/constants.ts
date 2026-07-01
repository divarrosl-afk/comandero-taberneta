/** Intervalo de polling operativa (panel, mesas) cuando Realtime no está o falla. */
export const OPERATIVA_POLL_MS = 5000;

/** Intervalo para refrescar contador de pendientes en banner de sync. */
export const SYNC_PENDING_POLL_MS = 3000;

/** Intervalo de reintento automático de la cola outbox. */
export const SYNC_FLUSH_MS = 30_000;
