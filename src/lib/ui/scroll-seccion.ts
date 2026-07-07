/** Desplaza la vista al inicio de un bloque de sección (p. ej. catálogo de platos). */
export function scrollSeccionAlInicio(el: HTMLElement | null): void {
  if (!el) return;
  requestAnimationFrame(() => {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}
