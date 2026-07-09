"use client";

const OPCIONES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12] as const;

interface ComensalesRapidoProps {
  value: number | null;
  onChange: (n: number | null) => void;
  compact?: boolean;
}

export function ComensalesRapido({
  value,
  onChange,
  compact = false,
}: ComensalesRapidoProps) {
  return (
    <div className={compact ? "" : "rounded-xl border-2 border-border bg-card p-3"}>
      {!compact && (
        <p className="mb-2 text-sm font-bold text-foreground">Comensales</p>
      )}
      <div className="flex flex-wrap gap-1.5">
        {OPCIONES.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(value === n ? null : n)}
            className={[
              "min-h-10 min-w-10 rounded-xl border-2 text-sm font-bold transition active:scale-95",
              value === n
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-foreground hover:border-primary/40",
            ].join(" ")}
          >
            {n}
          </button>
        ))}
      </div>
      {value && (
        <p className="mt-2 text-xs font-medium text-muted">
          {value === 1 ? "1 comensal" : `${value} comensales`} en ticket
        </p>
      )}
    </div>
  );
}
