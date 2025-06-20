import { type ReactNode } from "react";
import { Heading, Text } from "@react-email/components";
import { cn } from "../../src/lib/utils";

type TextProps = {
  children: React.ReactNode;
  className?: string;
};

export function EmailH1({ children, className }: TextProps) {
  return (
    <Heading as="h1" className={cn("text-2xl", className)}>
      {children}
    </Heading>
  );
}

export function EmailH2({ children, className }: TextProps) {
  return (
    <Heading as="h2" className={cn("text-xl", className)}>
      {children}
    </Heading>
  );
}

export function EmailH3({ children, className }: TextProps) {
  return (
    <Heading as="h3" className={cn("text-lg", className)}>
      {children}
    </Heading>
  );
}

export function EmailText({ children, className }: TextProps) {
  return <Text className={cn("text-base", className)}>{children}</Text>;
}
