/** Intervalo de sincronización automática entre dispositivos (panel, mesas, menú). */
export const APP_SYNC_POLL_MS = 10_000;

/** @deprecated Usar APP_SYNC_POLL_MS */
export const OPERATIVA_POLL_MS = APP_SYNC_POLL_MS;

/** Intervalo para refrescar contador de pendientes en banner de sync. */
export const SYNC_PENDING_POLL_MS = 3000;

/** Intervalo de reintento automático de la cola outbox. */
export const SYNC_FLUSH_MS = 30_000;
