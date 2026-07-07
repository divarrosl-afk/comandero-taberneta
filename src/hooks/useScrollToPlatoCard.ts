"use client";

import { useLayoutEffect } from "react";
import type { SeccionPlatos } from "@/types/comanda";

export interface PlatoEnfocado {
  seccion: SeccionPlatos;
  id: string;
  nonce: number;
}

const SCROLL_MARGIN_SELECTOR = "[data-plato-card]";
const HIGHLIGHT_MS = 2000;
const RETRY_DELAYS_MS = [0, 50, 120, 250];

function queryPlatoCard(platoId: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(
    `${SCROLL_MARGIN_SELECTOR}[data-plato-card="${platoId}"]`,
  );
}

function scrollToPlatoCard(platoId: string): boolean {
  const el = queryPlatoCard(platoId);
  if (!el) return false;

  el.scrollIntoView({ behavior: "smooth", block: "start" });
  return true;
}

/** Desplaza al ticket tras añadir un plato (todos los orígenes y pestañas). */
export function useScrollToPlatoCard(
  platoEnfocado: PlatoEnfocado | null,
  onHecho: () => void,
) {
  useLayoutEffect(() => {
    if (!platoEnfocado) return;

    const timeouts: ReturnType<typeof setTimeout>[] = [];
    let scrolled = false;

    const finalizar = () => {
      if (scrolled) {
        timeouts.push(setTimeout(onHecho, HIGHLIGHT_MS));
      }
    };

    for (const delay of RETRY_DELAYS_MS) {
      timeouts.push(
        setTimeout(() => {
          if (scrolled) return;
          if (scrollToPlatoCard(platoEnfocado.id)) {
            scrolled = true;
            finalizar();
          }
        }, delay),
      );
    }

    timeouts.push(
      setTimeout(() => {
        if (scrolled) return;
        if (scrollToPlatoCard(platoEnfocado.id)) {
          scrolled = true;
          finalizar();
        }
      }, 400),
    );

    return () => {
      for (const t of timeouts) clearTimeout(t);
    };
  }, [platoEnfocado, onHecho]);
}
