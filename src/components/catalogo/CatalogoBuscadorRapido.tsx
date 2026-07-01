"use client";

interface CatalogoBuscadorRapidoProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function CatalogoBuscadorRapido({
  value,
  onChange,
  placeholder = "Buscar plato, bebida, ingrediente, alérgeno…",
  className = "",
}: CatalogoBuscadorRapidoProps) {
  return (
    <div className={["relative", className].join(" ")}>
      <span
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-muted"
        aria-hidden
      >
        ⌕
      </span>
      <input
        type="search"
        inputMode="search"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-14 w-full rounded-2xl border-2 border-border bg-card py-3 pl-11 pr-12 text-base font-medium outline-none transition focus:border-primary"
        aria-label="Buscar en carta"
      />
      {value.length > 0 && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-2 top-1/2 flex h-10 min-w-10 -translate-y-1/2 items-center justify-center rounded-xl border border-border bg-background px-2 text-sm font-bold text-muted"
          aria-label="Limpiar búsqueda"
        >
          ✕
        </button>
      )}
    </div>
  );
}
