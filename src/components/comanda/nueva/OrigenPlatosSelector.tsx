"use client";

import { Chip } from "@/components/ui/Chip";
import type { OrigenPlatos } from "@/lib/carta/carta-admin";

interface OrigenPlatosSelectorProps {
  value: OrigenPlatos;
  onChange: (value: OrigenPlatos) => void;
  /** Si true: menú + carta almuerzo + carta cenas. Si false: solo cartas. */
  incluirMenu?: boolean;
}

const OPCIONES_MENU: { id: OrigenPlatos; label: string; corto: string }[] = [
  { id: "menu", label: "Menú del día", corto: "Menú" },
  { id: "carta-almuerzo", label: "Carta almuerzo", corto: "Almuerzo" },
  { id: "carta-cenas", label: "Carta cenas", corto: "Cenas" },
];

const OPCIONES_CARTA: { id: OrigenPlatos; label: string; corto: string }[] = [
  { id: "carta-almuerzo", label: "Carta almuerzo", corto: "Almuerzo" },
  { id: "carta-cenas", label: "Carta cenas", corto: "Cenas" },
];

export function OrigenPlatosSelector({
  value,
  onChange,
  incluirMenu = true,
}: OrigenPlatosSelectorProps) {
  const opciones = incluirMenu ? OPCIONES_MENU : OPCIONES_CARTA;

  return (
    <div className="mb-4 space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
        {incluirMenu ? "Origen de platos" : "Carta"}
      </p>
      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {opciones.map((opcion) => (
          <Chip
            key={opcion.id}
            label={opcion.corto}
            active={value === opcion.id}
            onClick={() => onChange(opcion.id)}
            size="sm"
            variant={opcion.id === "menu" ? "default" : "accent"}
          />
        ))}
      </div>
      <p className="text-xs text-muted">
        {opciones.find((o) => o.id === value)?.label}
        {value === "carta-almuerzo" && " · tapas, ensaladas, carnes, bocadillos…"}
        {value === "carta-cenas" && " · tapas, torradas y brasa de noche"}
      </p>
    </div>
  );
}
