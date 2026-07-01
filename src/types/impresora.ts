export type AnchoPapel = "58mm" | "80mm";

export type ModoImpresora = "mock" | "network";

export interface ImpresoraConfig {
  nombre: string;
  ip: string;
  puerto: number;
  anchoPapel: AnchoPapel;
  activa: boolean;
  modo: ModoImpresora;
}

export const IMPRESORA_DEFAULT: ImpresoraConfig = {
  nombre: "Impresora principal",
  ip: "",
  puerto: 9100,
  anchoPapel: "80mm",
  activa: true,
  modo: "network",
};

export const TEST_IMPRESORA_TEXTO =
  "TEST IMPRESORA\n\nLA TABERNETA\n\nOK";
