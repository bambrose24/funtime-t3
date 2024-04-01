"use client";

import Link from "next/link";
import { Button } from "~/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "~/components/ui/navigation-menu";
import {
  DesktopIcon,
  ExitIcon,
  GearIcon,
  MoonIcon,
  SunIcon,
} from "@radix-ui/react-icons";

import { Separator } from "~/components/ui/separator";
import { Text } from "~/components/ui/text";
import { type serverApi } from "~/trpc/server";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { capitalize } from "lodash";
import { type IconProps } from "@radix-ui/react-icons/dist/types";
import { useLogout } from "../(auth)/auth/useLogout";

type NavData = {
  data: Awaited<ReturnType<(typeof serverApi)["home"]["nav"]>>;
};

/**
 * TODO model the top right after Vercel
 */
export function ClientNav(props: NavData) {
  const logout = useLogout();
  const user = props.data?.dbUser;
  return (
    <div className="flex w-full flex-col">
      <div className="flex h-12 w-full flex-row justify-between px-2">
        <NavigationMenu className="h-full w-full items-center">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>My Leagues</NavigationMenuTrigger>
              <NavigationMenuContent className="flex min-w-[400px] flex-col gap-4 p-2">
                {props.data?.leagues.map((l) => {
                  if (!l) {
                    return null;
                  }
                  return (
                    <div
                      key={`my_leagues_nav_${l.league_id}`}
                      className="flex flex-row justify-between"
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
            {!user ? (
              <LoginButton />
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">{user.username}</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="py-2">
                  <div className="flex w-full flex-col items-start gap-1 px-2 py-2">
                    <p className="text-sm font-semibold">{user.username}</p>
                    <p className="text-sm">{user.email}</p>
                  </div>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem>
                    <MenuRow>
                      Settings
                      <GearIcon />
                    </MenuRow>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <MenuRow>
                      Theme
                      <ThemeToggler />
                    </MenuRow>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={async () => {
                      await logout();
                    }}
                  >
                    <MenuRow>
                      Log Out
                      <ExitIcon />
                    </MenuRow>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
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

function MenuRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex w-full flex-row items-center justify-between gap-3">
      {children}
    </div>
  );
}

function LoginButton() {
  return (
    <Link href="/login">
      <Button>Login</Button>
    </Link>
  );
}

type ThemeChoice = "dark" | "light" | "system";

function ThemeToggler() {
  const { theme, setTheme } = useTheme();

  const themeResult = theme as ThemeChoice;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          {capitalize(themeResult)}{" "}
          <ThemeIcon className="ml-2" theme={themeResult} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Select Theme</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={themeResult}
          onValueChange={(value) => {
            setTheme(value);
            // https://github.com/shadcn-ui/ui/issues/468
            setTimeout(() => (document.body.style.pointerEvents = ""), 500);
          }}
        >
          <DropdownMenuRadioItem value="light" className="flex flex-row gap-2">
            <ThemeIcon theme="light" />
            Light
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark" className="flex flex-row gap-2">
            <ThemeIcon theme="dark" />
            Dark
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system" className="flex flex-row gap-2">
            <ThemeIcon theme="system" />
            System
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ThemeIcon({ theme, ...props }: { theme: ThemeChoice } & IconProps) {
  switch (theme) {
    case "light":
      return <SunIcon {...props} />;
    case "dark":
      return <MoonIcon {...props} />;
    case "system":
      return <DesktopIcon {...props} />;
  }
}
