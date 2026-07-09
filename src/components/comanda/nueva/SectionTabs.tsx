"use client";

import type { SeccionPlatos } from "@/types/comanda";

export type TabComanda =
  | "mesa"
  | SeccionPlatos
  | "postres"
  | "cafes"
  | "extras"
  | "observaciones";

const TABS: { id: TabComanda; label: string }[] = [
  { id: "mesa", label: "Mesa" },
  { id: "entrantes", label: "Entr." },
  { id: "primeros", label: "1º" },
  { id: "segundos", label: "2º" },
  { id: "bebidas", label: "Beb." },
  { id: "postres", label: "Post." },
  { id: "cafes", label: "Café" },
  { id: "extras", label: "Extras" },
  { id: "observaciones", label: "Obs." },
];

interface SectionTabsProps {
  active: TabComanda;
  onChange: (tab: TabComanda) => void;
}

export function SectionTabs({ active, onChange }: SectionTabsProps) {
  return (
    <nav className="sticky top-[4.5rem] z-10 -mx-4 border-b border-border bg-background/95 px-2 py-2 backdrop-blur">
      <div className="mx-auto flex max-w-lg gap-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={[
              "shrink-0 rounded-xl px-3 py-2.5 text-sm font-bold transition active:scale-95",
              active === tab.id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-card text-foreground hover:bg-border/40",
            ].join(" ")}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
