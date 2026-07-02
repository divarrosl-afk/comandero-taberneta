"use client";

import { getEstadoXCafeLabel, getEstadoXLabel } from "@/data/postres-catalogo";
import { getEstadoPanelLabel } from "@/types/panel";
import type { ComandaPostres } from "@/types/postres";

interface PostresMarcaBannerProps {
  comanda: ComandaPostres;
}

export function PostresMarcaBanner({ comanda }: PostresMarcaBannerProps) {
  return (
    <div className="mb-3 rounded-xl border-2 border-purple-200 bg-purple-50 px-3 py-2.5">
      <p className="text-xs font-bold uppercase tracking-wide text-purple-800">
        Marca postres
      </p>
      <p className="mt-0.5 text-sm font-semibold text-purple-950">
        {getEstadoPanelLabel(comanda.estadoPanel)}
        {comanda.estadoX && (
          <span className="font-medium text-purple-700">
            {" "}
            · X: {getEstadoXLabel(comanda.estadoX)}
          </span>
        )}
        {comanda.estadoXCafe && (
          <span className="font-medium text-purple-700">
            {" "}
            · X café: {getEstadoXCafeLabel(comanda.estadoXCafe)}
          </span>
        )}
      </p>
      {comanda.postres.length > 0 && (
        <p className="mt-1 text-xs text-purple-800">
          Postres: {comanda.postres.map((p) => p.nombre).join(" · ")}
        </p>
      )}
      {(comanda.cafes?.length ?? 0) > 0 && (
        <p className="mt-1 text-xs text-purple-800">
          Cafés: {(comanda.cafes ?? []).map((c) => c.nombre).join(" · ")}
        </p>
      )}
    </div>
  );
}
