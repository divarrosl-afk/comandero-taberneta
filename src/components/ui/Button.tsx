import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
  children: ReactNode;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground active:scale-[0.98] hover:bg-primary/90",
  secondary:
    "bg-accent text-white active:scale-[0.98] hover:bg-accent/90",
  outline:
    "border-2 border-border bg-card text-foreground active:scale-[0.98] hover:bg-background",
  ghost: "bg-transparent text-foreground active:scale-[0.98] hover:bg-border/50",
  danger:
    "border-2 border-red-200 bg-red-50 text-red-700 active:scale-[0.98] hover:bg-red-100",
};

export function Button({
  variant = "primary",
  fullWidth = false,
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={[
        "inline-flex min-h-12 items-center justify-center rounded-xl px-4 py-3 text-base font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        fullWidth ? "w-full" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}
