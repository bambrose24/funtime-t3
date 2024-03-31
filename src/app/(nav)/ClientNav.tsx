"use client";

import Link from "next/link";
import { Button } from "~/components/ui/button";
import {
  Menubar,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
} from "~/components/ui/menubar";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "~/components/ui/navigation-menu";
import { ExitIcon } from "@radix-ui/react-icons";

import { Separator } from "~/components/ui/separator";
import { Text } from "~/components/ui/text";
import { type serverApi } from "~/trpc/server";
import { clientSupabase } from "~/utils/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";

type NavData = {
  data: Awaited<ReturnType<(typeof serverApi)["home"]["nav"]>>;
};

async function logout() {
  console.log("signing out...");
  await clientSupabase.auth.signOut();
}

export function ClientNav(props: NavData) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const user = props.data?.dbUser;
  return (
    <div className="flex w-full flex-col">
      <div className="flex h-12 w-full flex-row justify-between px-2">
        <NavigationMenu className="h-full w-full items-center">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>My Leagues</NavigationMenuTrigger>
              <NavigationMenuContent>
                {props.data?.leagues.map((l) => {
                  if (!l) {
                    return null;
                  }
                  return (
                    <div
                      key={`my_leagues_nav_${l.league_id}`}
                      className="flex w-[200px] flex-row justify-between"
                    >
                      <Text.Body>{l.name}</Text.Body>
                    </div>
                  );
                })}
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        {user ? (
          <div className="flex flex-row items-center">
            <Menubar>
              <MenubarMenu>
                <MenubarTrigger>
                  {user ? user.username : "Login"}
                </MenubarTrigger>
                <MenubarContent className="min-w-[200px]">
                  <MenubarItem
                    onClick={async (e) => {
                      await logout();
                      toast.success("You are now logged out.");
                      router.push("/login");
                    }}
                  >
                    <div className="flex w-full flex-row items-center justify-between">
                      <Text.Small>Log Out</Text.Small>
                      <ExitIcon />
                    </div>
                  </MenubarItem>
                  <MenubarItem
                    onClick={(e) => {
                      e.preventDefault();
                      setTheme((prev) => {
                        if (prev === "dark") return "light";
                        if (prev === "light") return "dark";
                        return prev;
                      });
                    }}
                  >
                    <div className="flex w-full flex-row items-center justify-between">
                      <Label htmlFor="dark-mode-toggle">
                        <Text.Small>Dark Mode</Text.Small>
                      </Label>
                      <Switch
                        id="dark-mode-toggle"
                        checked={theme === "dark"}
                      />
                    </div>
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>
            </Menubar>
          </div>
        ) : (
          <div className="flex h-full flex-col justify-center">
            <Link href="/login">
              <Button variant="outline">Login</Button>
            </Link>
          </div>
        )}
      </div>
      <Separator />
    </div>
  );
}
