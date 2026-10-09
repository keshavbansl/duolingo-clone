
import type { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  interactive?: boolean;
};

export default function Card({
  interactive = false,
  className = "",
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={`duo-card ${
        interactive ? "duo-card-interactive" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
