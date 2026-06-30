"use client";

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "lg";
}

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  size = "lg",
}: QuantityStepperProps) {
  const btnClass =
    size === "lg"
      ? "flex h-8 w-12 items-center justify-center text-xl font-bold text-primary"
      : "flex h-6 w-9 items-center justify-center text-lg font-bold text-primary";

  return (
    <div className="flex flex-col items-center rounded-xl border-2 border-border bg-card">
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        className={btnClass}
        aria-label="Aumentar"
      >
        +
      </button>
      <span
        className={
          size === "lg"
            ? "w-12 py-1 text-center text-base font-bold"
            : "w-9 text-center text-sm font-bold"
        }
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        className={btnClass}
        aria-label="Reducir"
      >
        −
      </button>
    </div>
  );
}
