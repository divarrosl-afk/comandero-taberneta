import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  children: ReactNode;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground active:scale-[0.97] hover:bg-primary/90",
  secondary:
    "bg-accent text-white active:scale-[0.97] hover:bg-accent/90",
  outline:
    "border-2 border-border bg-card text-foreground active:scale-[0.97] hover:bg-background",
  ghost:
    "bg-transparent text-foreground active:scale-[0.97] hover:bg-border/50",
  danger:
    "border-2 border-red-200 bg-red-50 text-red-700 active:scale-[0.97] hover:bg-red-100",
};

const sizes: Record<"sm" | "md" | "lg", string> = {
  sm: "min-h-10 px-3 text-sm",
  md: "min-h-12 px-4 text-base",
  lg: "min-h-14 px-5 text-lg",
};

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  type = "button",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={[
        "inline-flex items-center justify-center rounded-xl font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        sizes[size],
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
