import { getEstadoPanelStyle, getEstadoPanelLabel } from "@/types/panel";
import type { EstadoPanel } from "@/types/panel";

interface EstadoPanelBadgeProps {
  estado: EstadoPanel;
}

export function EstadoPanelBadge({ estado }: EstadoPanelBadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide",
        getEstadoPanelStyle(estado),
      ].join(" ")}
    >
      {getEstadoPanelLabel(estado)}
    </span>
  );
}
