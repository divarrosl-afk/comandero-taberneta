export type CamareroAccesoId = "mes" | "nota" | "post" | "pc";

export const CAMARERO_ACCESOS: {
  id: CamareroAccesoId;
  label: string;
  path?: string;
  href?: string;
  className: string;
  activoClassName: string;
}[] = [
  {
    id: "mes",
    label: "MES",
    href: "/mesas",
    className: "bg-stone-600 hover:bg-stone-700",
    activoClassName: "bg-stone-800 ring-2 ring-stone-300",
  },
  {
    id: "nota",
    label: "NOTA",
    path: "comanda/nueva",
    className: "bg-primary hover:bg-primary/90",
    activoClassName: "bg-primary ring-2 ring-primary-foreground/40",
  },
  {
    id: "post",
    label: "POST",
    path: "postres/nuevo",
    className: "bg-violet-600 hover:bg-violet-700",
    activoClassName: "bg-violet-800 ring-2 ring-violet-200",
  },
  {
    id: "pc",
    label: "PC",
    path: "panel",
    className: "bg-accent hover:bg-accent/90",
    activoClassName: "bg-accent ring-2 ring-orange-200",
  },
];

export function hrefCamareroAcceso(
  id: CamareroAccesoId,
  mesaId?: string | null,
): string {
  const acceso = CAMARERO_ACCESOS.find((a) => a.id === id);
  if (!acceso) return "/";
  if (acceso.href) return acceso.href;
  if (!acceso.path) return "/";
  const base = `/${acceso.path}`;
  if (!mesaId) return base;
  return `${base}?mesa=${encodeURIComponent(mesaId)}`;
}
