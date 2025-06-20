"use client";
import { usePathname } from "next/navigation";
import { type ReactNode } from "react";
import { type SettingsTabId, settingsTabIds, settingsTabs } from "./types";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { cn } from "~/lib/utils";

function useActiveSettingsTabId(): SettingsTabId | undefined {
  const pathname = usePathname();
  const lastPath = pathname.split("/").at(-1);
  return settingsTabIds.filter((id) => id === lastPath)?.at(0);
}

export default function SettingsLayout({ children }: { children: ReactNode }) {
  const tab = useActiveSettingsTabId();
  return (
    <div className="col-span-12 flex w-full flex-row justify-center py-4 md:col-span-8 md:col-start-3">
      {/* TODO add settings menu for mobile that is hidden above md */}
      <div className="flex w-full flex-col lg:grid lg:grid-cols-4 lg:gap-3">
        <div className="col-span-1 hidden flex-col gap-1 lg:flex">
          {settingsTabs.map((t) => {
            return (
              <Link href={t.href} key={t.id} className="w-full">
                <Button
                  type="button"
                  variant="ghost"
                  className={cn(
                    "flex w-full justify-start",
                    t.id === tab ? "underline" : "",
                  )}
                >
                  <div className="flex flex-row items-center gap-2 px-4">
                    {t.icon} {t.label}
                  </div>
                </Button>
              </Link>
            );
          })}
        </div>
        <div className="col-span-3 flex-col">{children}</div>
      </div>
    </div>
  );
}
