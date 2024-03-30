"use client";

import Link from "next/link";
import { Button } from "~/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "~/components/ui/navigation-menu";
import { Text } from "~/components/ui/text";
import { type serverApi } from "~/trpc/server";

type NavData = {
  data: Awaited<ReturnType<(typeof serverApi)["home"]["nav"]>>;
};

export function ClientNav(props: NavData) {
  console.log("props?", props);
  const user = props.data?.dbUser;
  return (
    <div className="flex h-12 w-full flex-row justify-between bg-primary px-2">
      <NavigationMenu className="h-full w-full items-center">
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Leagues</NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="h-20 w-[200px] flex-col gap-2">
                <div className="w-full justify-center">
                  <Text.H3>League Name</Text.H3>
                </div>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      {user ? (
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>
                {user ? user.username : "Login"}
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="h-20 w-[200px] flex-col gap-2">
                  <div className="w-full justify-center">
                    {/* Some logged in menu options (logout, settings) */}
                  </div>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      ) : (
        <div className="flex h-full flex-col justify-center">
          <Link href="/login">
            <Button variant="outline">Login</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
