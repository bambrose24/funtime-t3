import "~/styles/globals.css";

import { Inter } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import type { Metadata } from "next";
import { ThemeProvider } from "../components/theme-provider";
import { cn } from "~/lib/utils";
import { Toaster } from "~/components/ui/sonner";
import { Nav } from "./_nav/nav";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Funtime",
  description: "An NFL pool system.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="overflow-y-scroll">
      <body className={cn(inter.variable, `h-full w-full font-sans`)}>
        <TRPCReactProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <Nav />
            {children}
            <Toaster />
          </ThemeProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
