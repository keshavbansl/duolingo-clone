
import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "blue" | "secondary" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: "duo-button-primary",
  blue: "duo-button-blue",
  secondary: "border-2 border-border bg-white text-foreground",
  danger: "duo-button-danger",
};

export default function Button({
  variant = "primary",
  className = "",
  type = "button",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`duo-button ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
