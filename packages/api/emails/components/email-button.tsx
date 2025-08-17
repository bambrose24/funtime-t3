import { Button as ReactEmailButton } from "@react-email/components";
import React from "react";
import { cn } from "../../lib/utils";

interface EmailButtonProps {
  href?: string;
  variant?: "primary" | "secondary" | "destructive" | "correct" | "warning";
  className?: string;
  children: React.ReactNode;
}

const variantStyles = {
  primary: {
    backgroundColor: "hsl(142.1, 76.2%, 36.3%)", // --primary
    color: "hsl(355.7, 100%, 97.3%)", // --primary-foreground
    borderRadius: "0.5rem", // --radius
    padding: "0.75rem 1.5rem",
    textDecoration: "none",
    display: "inline-block",
  },
  secondary: {
    backgroundColor: "hsl(240, 4.8%, 95.9%)", // --secondary
    color: "hsl(240, 5.9%, 10%)", // --secondary-foreground
    borderRadius: "0.5rem", // --radius
    padding: "0.75rem 1.5rem",
    textDecoration: "none",
    display: "inline-block",
  },
  destructive: {
    backgroundColor: "hsl(0, 84.2%, 60.2%)", // --destructive
    color: "hsl(0, 0%, 98%)", // --destructive-foreground
    borderRadius: "0.5rem", // --radius
    padding: "0.75rem 1.5rem",
    textDecoration: "none",
    display: "inline-block",
  },
  correct: {
    backgroundColor: "hsl(142, 76%, 36%)", // --correct
    color: "hsl(240, 10%, 3.9%)", // --correct-foreground
    borderRadius: "0.5rem", // --radius
    padding: "0.75rem 1.5rem",
    textDecoration: "none",
    display: "inline-block",
  },
  warning: {
    backgroundColor: "#f59e0b", // --warning
    color: "hsl(240, 10%, 3.9%)", // --warning-foreground
    borderRadius: "0.5rem", // --radius
    padding: "0.75rem 1.5rem",
    textDecoration: "none",
    display: "inline-block",
  },
};

export function EmailButton({
  href,
  variant = "primary",
  className,
  children,
}: EmailButtonProps) {
  // Define a map to convert variants to the corresponding styles

  return (
    <ReactEmailButton
      href={href}
      style={variantStyles[variant]}
      className={cn(className)}
    >
      {children}
    </ReactEmailButton>
  );
}
