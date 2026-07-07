import { crearCatalogoDefault } from "@/data/catalogo-default";
import { claveProductoCatalogo } from "@/lib/catalogo/catalogo-clave";
import { createId } from "@/lib/id/create-id";
import { productoToRow, rowToProducto, type DbProducto } from "@/lib/supabase/mappers";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { ProductoCatalogo } from "@/types/catalogo";

export type SyncCatalogoResult = {
  inserted: number;
  updated: number;
  total: number;
};

function fusionarConExistente(
  defecto: ProductoCatalogo,
  existente: ProductoCatalogo,
): ProductoCatalogo {
  return {
    ...defecto,
    id: existente.id,
    activo: existente.activo,
    agotado: existente.agotado,
    favorito: existente.favorito,
    recomendado: existente.recomendado,
    precioCarta: existente.precioCarta ?? defecto.precioCarta,
    precioMenu: existente.precioMenu ?? defecto.precioMenu,
    notasInternas: existente.notasInternas ?? defecto.notasInternas,
  };
}

function necesitaActualizacion(
  fusionado: ProductoCatalogo,
  existente: ProductoCatalogo,
): boolean {
  return (
    fusionado.categoriaCarta !== existente.categoriaCarta ||
    fusionado.cartaServicio !== existente.cartaServicio ||
    fusionado.orden !== existente.orden ||
    fusionado.nombre !== existente.nombre ||
    JSON.stringify(fusionado.usosComanda ?? []) !==
      JSON.stringify(existente.usosComanda ?? [])
  );
}

export function prepararSyncCatalogo(
  defectos: ProductoCatalogo[],
  existentes: ProductoCatalogo[],
  clavesExcluidas: ReadonlySet<string> = new Set(),
): {
  aSubir: ProductoCatalogo[];
  inserted: number;
  updated: number;
} {
  const porClave = new Map<string, ProductoCatalogo>();
  for (const producto of existentes) {
    porClave.set(claveProductoCatalogo(producto), producto);
  }

  let inserted = 0;
  let updated = 0;
  const aSubir: ProductoCatalogo[] = [];

  for (const defecto of defectos) {
    const clave = claveProductoCatalogo(defecto);
    if (clavesExcluidas.has(clave)) continue;

    const existente = porClave.get(clave);
    if (existente) {
      const fusionado = fusionarConExistente(defecto, existente);
      if (necesitaActualizacion(fusionado, existente)) {
        aSubir.push(fusionado);
        updated += 1;
      }
    } else {
      aSubir.push({ ...defecto, id: createId() });
      inserted += 1;
    }
  }

  return { aSubir, inserted, updated };
}

/** Fusiona catálogo guardado con defaults (nuevos productos sin borrar personalizados). */
export function mergeCatalogoCompleto(
  existentes: ProductoCatalogo[],
  defectos: ProductoCatalogo[],
  clavesExcluidas: ReadonlySet<string> = new Set(),
): ProductoCatalogo[] {
  const porClave = new Map<string, ProductoCatalogo>();
  for (const producto of existentes) {
    porClave.set(claveProductoCatalogo(producto), producto);
  }

  const resultado = [...existentes];

  for (const defecto of defectos) {
    const clave = claveProductoCatalogo(defecto);
    if (clavesExcluidas.has(clave)) continue;

    const existente = porClave.get(clave);
    if (existente) {
      const fusionado = fusionarConExistente(defecto, existente);
      const idx = resultado.findIndex((p) => p.id === existente.id);
      if (idx >= 0) resultado[idx] = fusionado;
    } else {
      const nuevo = { ...defecto, id: createId() };
      resultado.push(nuevo);
      porClave.set(clave, nuevo);
    }
  }

  return resultado;
}

export async function syncCatalogoConDefaults(
  restauranteId: string,
): Promise<SyncCatalogoResult> {
  const admin = getSupabaseAdminClient();
  if (!admin) {
    throw new Error("Supabase admin no configurado");
  }

  const { data, error } = await admin
    .from("productos")
    .select("*")
    .eq("restaurante_id", restauranteId)
    .is("deleted_at", null);

  if (error) throw new Error(`Catálogo: ${error.message}`);

  const { data: eliminadosData, error: eliminadosError } = await admin
    .from("productos")
    .select("*")
    .eq("restaurante_id", restauranteId)
    .not("deleted_at", "is", null);

  if (eliminadosError) {
    throw new Error(`Catálogo eliminados: ${eliminadosError.message}`);
  }

  const existentes = ((data ?? []) as DbProducto[]).map(rowToProducto);
  const clavesExcluidas = new Set(
    ((eliminadosData ?? []) as DbProducto[]).map((row) =>
      claveProductoCatalogo(rowToProducto(row)),
    ),
  );
  const defectos = crearCatalogoDefault();
  const { aSubir, inserted, updated } = prepararSyncCatalogo(
    defectos,
    existentes,
    clavesExcluidas,
  );

  if (aSubir.length === 0) {
    return { inserted: 0, updated: 0, total: existentes.length };
  }

  const rows = aSubir.map((p) => productoToRow(p, restauranteId));
  const { error: upsertError } = await admin.from("productos").upsert(rows, {
    onConflict: "id",
  });
  if (upsertError) throw new Error(`Catálogo sync: ${upsertError.message}`);

  const { count } = await admin
    .from("productos")
    .select("*", { count: "exact", head: true })
    .eq("restaurante_id", restauranteId)
    .is("deleted_at", null);

  return {
    inserted,
    updated,
    total: count ?? existentes.length + inserted,
  };
}
