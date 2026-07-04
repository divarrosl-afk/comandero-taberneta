import type { MenuDiaConfig, PlatoMenuDiaImportado } from "@/types/menu-dia";

const PAYLOAD_MARKER = "\n<!--MENU_IMPORT:v1-->";

export interface MenuImportadosPayload {
  primerosImportados?: PlatoMenuDiaImportado[];
  segundosImportados?: PlatoMenuDiaImportado[];
}

export function isMissingImportColumnsError(message: string): boolean {
  return /primeros_importados|segundos_importados|schema cache/i.test(
    message,
  );
}

export function stripMenuImportPayload(observaciones?: string | null): {
  observacionesVisibles: string;
  payload: MenuImportadosPayload | null;
} {
  if (!observaciones) return { observacionesVisibles: "", payload: null };

  const idx = observaciones.indexOf(PAYLOAD_MARKER);
  if (idx === -1) {
    return { observacionesVisibles: observaciones, payload: null };
  }

  const observacionesVisibles = observaciones.slice(0, idx).trimEnd();
  try {
    const payload = JSON.parse(
      observaciones.slice(idx + PAYLOAD_MARKER.length),
    ) as MenuImportadosPayload;
    return { observacionesVisibles, payload };
  } catch {
    return { observacionesVisibles: observaciones, payload: null };
  }
}

export function attachMenuImportPayload(
  observaciones: string | undefined,
  config: Pick<MenuDiaConfig, "primerosImportados" | "segundosImportados">,
): string | null {
  const { observacionesVisibles } = stripMenuImportPayload(observaciones);
  const payload: MenuImportadosPayload = {
    primerosImportados: config.primerosImportados,
    segundosImportados: config.segundosImportados,
  };

  const tienePlatos =
    (payload.primerosImportados?.length ?? 0) > 0 ||
    (payload.segundosImportados?.length ?? 0) > 0;

  if (!tienePlatos) {
    return observacionesVisibles || null;
  }

  return `${observacionesVisibles}${PAYLOAD_MARKER}${JSON.stringify(payload)}`;
}
