/** Fecha local YYYY-MM-DD desde ISO o Date */
export function fechaDeIso(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Zona horaria del restaurante (cierre y borrado en servidor). */
export const ZONA_RESTAURANTE = "Europe/Madrid";

export function fechaDeIsoEnZona(
  iso: string,
  timeZone: string = ZONA_RESTAURANTE,
): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

export function hoyFecha(): string {
  return fechaDeIso(new Date().toISOString());
}

export function esMismaFecha(iso: string, fecha: string): boolean {
  return fechaDeIso(iso) === fecha;
}

export function esMismaFechaRestaurante(iso: string, fecha: string): boolean {
  return fechaDeIsoEnZona(iso) === fecha;
}

export function formatearFechaDisplay(fecha: string): string {
  const [y, m, d] = fecha.split("-");
  return `${d}/${m}/${y}`;
}
