/**
 * Elimina credenciales de mensajes de error antes de imprimir en CI.
 */
export function sanitizeLogMessage(input) {
  let msg = String(input ?? "");
  msg = msg.replace(/postgresql:\/\/[^\s'"]+/gi, "postgresql://***");
  msg = msg.replace(/Bearer\s+[A-Za-z0-9._-]+/gi, "Bearer ***");
  msg = msg.replace(/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g, "eyJ***");
  msg = msg.replace(/\bsb_publishable_[A-Za-z0-9_-]+\b/g, "sb_publishable_***");
  return msg;
}
