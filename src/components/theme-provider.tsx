"use client";

import { ReactNode, useEffect } from "react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";
import { cn } from "~/lib/utils";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <ThemeListener>{children}</ThemeListener>
    </NextThemesProvider>
  );
}

function ThemeListener({ children }: { children: ReactNode }) {
  const { theme } = useTheme();

  return (
    <div className={cn("h-full w-full", theme === "dark" ? "dark" : "")}>
      {children}
    </div>
  );
}
