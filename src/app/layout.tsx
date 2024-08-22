import "~/styles/globals.css";

import { Inter } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { TRPCReactProvider } from "~/trpc/react";
import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "../components/theme-provider";
import { cn } from "~/lib/utils";
import { Toaster } from "~/components/ui/sonner";
import { Nav } from "./_nav/nav";
import { AxiomWebVitals } from "next-axiom";
import { UserProviderServer } from "./(auth)/provider/UserProviderServer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Funtime",
  description: "An NFL pool system.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export const viewport: Viewport = {
  initialScale: 1,
  width: "device-width",
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="min-h-screen overflow-y-auto"
    >
      <body
        className={cn(inter.variable, `min-w-screen min-h-screen font-sans`)}
      >
        <TRPCReactProvider>
          <UserProviderServer>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange
            >
              <Nav />
              <div className="grid grid-cols-12 gap-4 p-2">{children}</div>
              <Toaster position="bottom-right" richColors duration={5000} />
              <AxiomWebVitals />
              <SpeedInsights />
            </ThemeProvider>
          </UserProviderServer>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
