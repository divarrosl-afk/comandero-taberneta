export type GrupoCafe = "cafe" | "carajillo" | "infusion";

export interface OpcionCafeRapida {
  id: string;
  grupo: GrupoCafe;
  label: string;
  /** Texto que sale en el ticket */
  etiquetaTicket: string;
}

export const OPCIONES_CAFE: OpcionCafeRapida[] = [
  { id: "c-solo", grupo: "cafe", label: "Café solo", etiquetaTicket: "C" },
  { id: "c-largo", grupo: "cafe", label: "Café solo largo", etiquetaTicket: "C largo" },
  { id: "c-hielo", grupo: "cafe", label: "Café solo + hielo", etiquetaTicket: "C+H" },
  { id: "c-leche", grupo: "cafe", label: "Café con leche", etiquetaTicket: "C/L" },
  {
    id: "cl-h",
    grupo: "cafe",
    label: "Café con leche + hielo",
    etiquetaTicket: "C/L + H",
  },
  { id: "cortado", grupo: "cafe", label: "Cortado", etiquetaTicket: "Ç" },
  { id: "cortado-nat", grupo: "cafe", label: "Cortado natural", etiquetaTicket: "Ç NAT" },
  {
    id: "cortado-largo",
    grupo: "cafe",
    label: "Cortado largo",
    etiquetaTicket: "Ç largo",
  },
];

export const SABORES_CARAJILLO = [
  "manzanilla",
  "menta poleo",
  "frutos rojos",
  "chupito de licor",
] as const;

export const INFUSIONES = [
  "manzanilla",
  "menta poleo",
  "frutos rojos",
  "té verde",
] as const;

export function etiquetaCarajillo(sabor: string): string {
  return `CARAJ DE ${sabor}`;
}

export function opcionesCafePorGrupo(grupo: GrupoCafe): OpcionCafeRapida[] {
  return OPCIONES_CAFE.filter((o) => o.grupo === grupo);
}
