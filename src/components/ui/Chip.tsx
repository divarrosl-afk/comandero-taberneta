"use client";

interface ChipProps {
  label: string;
  active?: boolean;
  count?: number;
  onClick: () => void;
  size?: "sm" | "md";
  variant?: "default" | "accent" | "urgent";
}

const variantStyles = {
  default: {
    active: "border-primary bg-primary text-primary-foreground shadow-sm",
    inactive: "border-border bg-card text-foreground hover:border-primary/30",
  },
  accent: {
    active: "border-accent bg-accent text-white shadow-sm",
    inactive: "border-border bg-card text-foreground hover:border-accent/40",
  },
  urgent: {
    active: "border-red-600 bg-red-600 text-white shadow-sm",
    inactive: "border-red-200 bg-red-50 text-red-700",
  },
};

export function Chip({
  label,
  active = false,
  count,
  onClick,
  size = "md",
  variant = "default",
}: ChipProps) {
  const styles = variantStyles[variant];
  const displayLabel = count && count > 0 ? `${label} x${count}` : label;

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-full border-2 font-semibold transition active:scale-95",
        size === "sm" ? "min-h-9 px-3 text-xs" : "min-h-11 px-4 text-sm",
        active || (count !== undefined && count > 0)
          ? styles.active
          : styles.inactive,
      ].join(" ")}
    >
      {displayLabel}
    </button>
  );
}
