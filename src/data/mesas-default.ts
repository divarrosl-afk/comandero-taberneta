import {
  codigoVarianteB,
  type MesaConfig,
  type ZonaMesa,
} from "@/types/mesas";

function mesa(
  codigo: string,
  zona: ZonaMesa,
  opts?: Partial<
    Pick<
      MesaConfig,
      | "nombreVisible"
      | "orden"
      | "activa"
      | "permiteVarianteB"
      | "esVarianteB"
      | "mesaPrincipalId"
    >
  >,
): MesaConfig {
  return {
    id: codigo,
    codigo,
    nombreVisible: opts?.nombreVisible ?? codigo,
    zona,
    activa: opts?.activa ?? true,
    orden: opts?.orden ?? 0,
    permiteVarianteB: opts?.permiteVarianteB ?? false,
    esVarianteB: opts?.esVarianteB ?? false,
    mesaPrincipalId: opts?.mesaPrincipalId,
  };
}

function rango(prefijo: string, desde: number, hasta: number, zona: ZonaMesa) {
  const lista: MesaConfig[] = [];
  for (let i = desde; i <= hasta; i++) {
    lista.push(mesa(`${prefijo}${i}`, zona, { orden: i }));
  }
  return lista;
}

/** Distribución real La Taberneta de Ca la Ingrid */
export function crearMesasDefault(): MesaConfig[] {
  const comedor = [
    ...rango("C", 1, 7, "comedor"),
    mesa("TV", "comedor", { orden: 8 }),
  ];

  const barra = rango("B", 0, 7, "barra");
  const fachada = rango("F", 0, 2, "fachada");
  const terraza = rango("T", 1, 5, "terraza");

  const rambla: MesaConfig[] = [];
  for (let i = 1; i <= 10; i++) {
    const codigo = `R${i}`;
    const permiteB = i === 2 || i === 8;
    rambla.push(
      mesa(codigo, "rambla", {
        orden: i,
        permiteVarianteB: permiteB,
      }),
    );
    if (permiteB) {
      rambla.push(
        mesa(codigoVarianteB(codigo), "rambla", {
          orden: i + 0.5,
          esVarianteB: true,
          mesaPrincipalId: codigo,
          activa: true,
        }),
      );
    }
  }

  return [...comedor, ...barra, ...fachada, ...terraza, ...rambla];
}
