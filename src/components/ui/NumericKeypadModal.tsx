"use client";

import { useEffect, useState, type ReactNode } from "react";

interface NumericKeypadModalProps {
  open: boolean;
  titulo: string;
  valorInicial?: number;
  onConfirm: (cantidad: number) => void;
  onCancel: () => void;
}

export function NumericKeypadModal({
  open,
  titulo,
  valorInicial = 0,
  onConfirm,
  onCancel,
}: NumericKeypadModalProps) {
  const [entrada, setEntrada] = useState("");

  useEffect(() => {
    if (open) {
      setEntrada(valorInicial > 0 ? String(valorInicial) : "");
    }
  }, [open, valorInicial]);

  if (!open) return null;

  const pulsar = (digito: string) => {
    setEntrada((prev) => {
      if (prev === "0") return digito;
      if (prev.length >= 3) return prev;
      return prev + digito;
    });
  };

  const cantidad = Math.min(999, Math.max(0, parseInt(entrada, 10) || 0));

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4"
      onClick={onCancel}
      role="presentation"
    >
      <div
        className="w-full max-w-sm rounded-2xl border-2 border-border bg-card p-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="numeric-keypad-titulo"
      >
        <p
          id="numeric-keypad-titulo"
          className="mb-2 text-center text-sm font-semibold text-muted"
        >
          {titulo}
        </p>
        <p className="mb-4 rounded-xl bg-background py-3 text-center text-3xl font-bold tabular-nums">
          {entrada || "0"}
        </p>

        <div className="grid grid-cols-3 gap-2">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
            <Tecla key={d} onClick={() => pulsar(d)}>
              {d}
            </Tecla>
          ))}
          <Tecla variant="muted" onClick={() => setEntrada("")}>
            C
          </Tecla>
          <Tecla onClick={() => pulsar("0")}>0</Tecla>
          <Tecla variant="muted" onClick={() => setEntrada((p) => p.slice(0, -1))}>
            ←
          </Tecla>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onConfirm(0)}
            className="min-h-12 rounded-xl border-2 border-border font-semibold text-muted"
          >
            Quitar
          </button>
          <button
            type="button"
            onClick={() => onConfirm(cantidad)}
            className="min-h-12 rounded-xl bg-primary font-bold text-primary-foreground"
          >
            OK · {cantidad || 0}
          </button>
        </div>
      </div>
    </div>
  );
}

function Tecla({
  children,
  onClick,
  variant = "default",
}: {
  children: ReactNode;
  onClick: () => void;
  variant?: "default" | "muted";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "min-h-14 rounded-xl text-xl font-bold transition active:scale-95",
        variant === "muted"
          ? "border-2 border-border bg-background text-muted"
          : "border-2 border-border bg-background text-foreground",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
