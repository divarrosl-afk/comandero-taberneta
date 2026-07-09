import { crearCatalogoDefault } from "@/data/catalogo-default";
import { claveProductoCatalogo, normalizarNombreCatalogo } from "@/lib/catalogo/catalogo-clave";
import {
  claveEmparejarCatalogo,
  idsProductosCatalogoObsoletos,
  legaciesPorClaveCanonica,
} from "@/lib/catalogo/catalogo-legacy";
import { createId } from "@/lib/id/create-id";
import { productoToRow, rowToProducto, type DbProducto } from "@/lib/supabase/mappers";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { ProductoCatalogo } from "@/types/catalogo";

export type SyncCatalogoResult = {
  inserted: number;
  updated: number;
  deleted: number;
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
    nombreCorto: undefined,
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
    fusionado.nombreCorto !== existente.nombreCorto ||
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

/** Fusiona catálogo guardado con defaults, eliminando legacy duplicado. */
export function mergeCatalogoCompleto(
  existentes: ProductoCatalogo[],
  defectos: ProductoCatalogo[],
  clavesExcluidas: ReadonlySet<string> = new Set(),
): ProductoCatalogo[] {
  const nombresDefecto = new Set(
    defectos.map((d) => normalizarNombreCatalogo(d.nombre)),
  );
  const idsObsoletos = new Set(
    idsProductosCatalogoObsoletos(existentes, defectos),
  );
  const legacies = legaciesPorClaveCanonica(existentes, defectos);
  const defectosPorEmparejar = new Map(
    defectos.map((d) => [claveEmparejarCatalogo(d, nombresDefecto), d]),
  );

  const personalizados = existentes.filter((p) => {
    if (idsObsoletos.has(p.id)) return false;
    const emparejar = claveEmparejarCatalogo(p, nombresDefecto);
    return !defectosPorEmparejar.has(emparejar);
  });

  const resultado: ProductoCatalogo[] = [...personalizados];

  for (const defecto of defectos) {
    const clave = claveProductoCatalogo(defecto);
    const emparejar = claveEmparejarCatalogo(defecto, nombresDefecto);
    if (clavesExcluidas.has(clave)) continue;

    const existente = existentes.find(
      (p) =>
        !idsObsoletos.has(p.id) &&
        claveEmparejarCatalogo(p, nombresDefecto) === emparejar,
    );
    const legacyGrupo = legacies.get(emparejar) ?? [];

    let fusionado = defecto;
    if (existente) {
      fusionado = fusionarConExistente(defecto, existente);
    }
    for (const leg of legacyGrupo) {
      fusionado = fusionarConExistente(fusionado, leg);
    }

    resultado.push({
      ...fusionado,
      id: existente?.id ?? legacyGrupo[0]?.id ?? createId(),
    });
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

  const idsObsoletos = idsProductosCatalogoObsoletos(existentes, defectos);
  let deleted = 0;

  if (idsObsoletos.length > 0) {
    const { error: deleteError } = await admin
      .from("productos")
      .update({ deleted_at: new Date().toISOString() })
      .eq("restaurante_id", restauranteId)
      .in("id", idsObsoletos);
    if (deleteError) throw new Error(`Catálogo cleanup: ${deleteError.message}`);
    deleted = idsObsoletos.length;
  }

  const existentesLimpios = existentes.filter((p) => !idsObsoletos.includes(p.id));
  const { aSubir, inserted, updated } = prepararSyncCatalogo(
    defectos,
    existentesLimpios,
    clavesExcluidas,
  );

  if (aSubir.length === 0) {
    return {
      inserted: 0,
      updated: 0,
      deleted,
      total: existentesLimpios.length,
    };
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
    deleted,
    total: count ?? existentesLimpios.length + inserted,
  };
}
