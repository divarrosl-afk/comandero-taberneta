"use client";

import { useEffect, type ReactNode } from "react";
import { getCatalogo } from "@/lib/catalogo/catalogo-service";
import { initializeDataLayer } from "@/lib/data/data-layer";
import { usesRemoteData } from "@/lib/data/backend";
import { getImpresoraConfig } from "@/lib/impresora/impresora-config-service";
import { getMenuDia } from "@/lib/menu-dia/menu-dia-service";
import { getMesasRepository } from "@/lib/mesas/mesas-service";
import { guardarMesasConfig } from "@/lib/storage/mesas";

export function DataLayerProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    initializeDataLayer();

    if (usesRemoteData()) {
      void Promise.all([
        getMenuDia(),
        getCatalogo(),
        getImpresoraConfig(),
        getMesasRepository()
          .getConfig()
          .then((mesas) => guardarMesasConfig(mesas)),
      ]);
    }
  }, []);

  return children;
}
