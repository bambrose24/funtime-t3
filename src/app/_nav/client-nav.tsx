"use client";

import Link from "next/link";
import { Button } from "~/components/ui/button";
import {
  DesktopIcon,
  ExitIcon,
  GearIcon,
  MoonIcon,
  SunIcon,
} from "@radix-ui/react-icons";

import { Separator } from "~/components/ui/separator";
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
import { useLeagueIdFromPath } from "~/utils/hooks/useLeagueIdFromPath";
import {
  ChevronsUpDown,
  CircleUser,
  HomeIcon,
  InfoIcon,
  PenIcon,
  PlusIcon,
  SettingsIcon,
  TrophyIcon,
} from "lucide-react";
import { Avatar } from "~/components/ui/avatar";
import { usePathname, useRouter } from "next/navigation";
import { FuntimeAvatarFallback } from "./AvatarFallback";
import { type RouterOutputs } from "~/trpc/types";
import { clientApi } from "~/trpc/react";
import { MemberRole } from "~/generated/prisma-client";
import { useEffect } from "react";
import { PrefetchKind } from "next/dist/client/components/router-reducer/router-reducer-types";

type NavData = {
  data: RouterOutputs["home"]["nav"];
  canCreateLeague: RouterOutputs["league"]["canCreate"];
};

export function ClientNav({ data: initialData, canCreateLeague }: NavData) {
  const leagueId = useLeagueIdFromPath();
  const logout = useLogout();
  const router = useRouter();

  const { data } = clientApi.home.nav.useQuery(undefined, {
    initialData,
  });

  const user = data?.dbUser;
  const leagues = data?.leagues;

  const chosenLeague = leagues?.find((l) => l.league_id === leagueId);

  const activeLeagues = leagues?.filter(
    (l) => l.status !== "completed" && new Date().getFullYear() - 1 < l.season,
  );
  const inactiveLeagues = leagues?.filter(
    (l) => l.status === "completed" || new Date().getFullYear() - 1 >= l.season,
  );

  useEffect(() => {
    activeLeagues?.forEach((league) => {
      router.prefetch(`/league/${league.league_id}`, {
        kind: PrefetchKind.FULL,
      });
    });
  }, [router, activeLeagues]);

  const settingsHref = "/settings";

  return (
    <div className="flex w-full flex-col bg-background">
      <div className="flex h-12 w-full flex-row justify-between px-2">
        <div className="flex flex-row items-center gap-2">
          {leagues?.length ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex flex-row items-center gap-2"
                >
                  {chosenLeague ? chosenLeague.name : "My Leagues"}
                  <ChevronsUpDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 p-1">
                <DropdownMenuLabel>Active Leagues</DropdownMenuLabel>
                {activeLeagues?.map((l) => {
                  return (
                    <Link
                      prefetch
                      passHref
                      href={`/league/${l.league_id}`}
                      key={l.league_id}
                    >
                      <DropdownMenuItem>
                        <MenuRow>{l.name}</MenuRow>
                      </DropdownMenuItem>
                    </Link>
                  );
                })}
                {!canCreateLeague ? null : (
                  <>
                    <DropdownMenuSeparator className="my-2" />
                    <DropdownMenuItem
                      className="flex gap-2"
                      onSelect={() => {
                        router.push("/league/create");
                      }}
                    >
                      <PlusIcon className="h-4 w-4 text-foreground" />
                      <span>Create a League</span>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator className="my-2" />

                <DropdownMenuLabel>Prior Leagues</DropdownMenuLabel>
                {inactiveLeagues?.map((l) => {
                  return (
                    <Link
                      prefetch
                      passHref
                      href={`/league/${l.league_id}`}
                      key={l.league_id}
                    >
                      <DropdownMenuItem>
                        <MenuRow>{l.name}</MenuRow>
                      </DropdownMenuItem>
                    </Link>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <></>
          )}
          {chosenLeague && (
            <>
              <Separator orientation="vertical" className="my-4" />
              <LeagueDropdownMenu chosenLeague={chosenLeague} />
            </>
          )}
        </div>
        {user ? (
          <div className="flex flex-row items-center">
            {!user ? (
              <LoginButton />
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Avatar className="border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground">
                    <FuntimeAvatarFallback username={user.username} />
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="py-2">
                  <div className="flex w-full flex-col items-start gap-1 px-2 py-2">
                    <p className="text-sm font-semibold">{user.username}</p>
                    <p className="text-sm">{user.email}</p>
                  </div>

                  <DropdownMenuSeparator />

                  <Link href={settingsHref} prefetch>
                    <DropdownMenuItem>
                      <MenuRow>
                        Settings
                        <GearIcon />
                      </MenuRow>
                    </DropdownMenuItem>
                  </Link>
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
            <Link href="/login" prefetch>
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
    <Link href="/login" prefetch>
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
        <Button size="sm" variant="outline">
          {capitalize(themeResult)}
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

type ChosenLeague = NonNullable<
  NonNullable<RouterOutputs["home"]["nav"]>["leagues"][number]
>;

type TabOption =
  | "home"
  | "make-picks"
  | "leaderboard"
  | "admin"
  | "my-profile"
  | "league-info";

function useActiveLeagueSubPath(): TabOption {
  const pathname = usePathname();
  if (pathname.includes("/leaderboard")) {
    return "leaderboard";
  }
  if (pathname.includes("pick")) {
    return "make-picks";
  }
  if (pathname.includes("admin")) {
    return "admin";
  }
  if (pathname.includes("my-profile")) {
    return "my-profile";
  }
  if (pathname.includes("/info")) {
    return "league-info";
  }
  return "home";
}

function TabLabel() {
  const activeSubTab = useActiveLeagueSubPath();
  switch (activeSubTab) {
    case "home":
      return (
        <>
          <div className="hidden lg:block">League Home</div>
          <div className="lg:hidden">Home</div>
        </>
      );
    case "leaderboard":
      return <div>Leaderboard</div>;
    case "make-picks":
      return (
        <>
          <div className="hidden lg:block">Make Picks</div>
          <div className="lg:hidden">Pick</div>
        </>
      );
    case "admin":
      return (
        <>
          <div className="hidden lg:block">Admin Settings</div>
          <div className="lg:hidden">Admin</div>
        </>
      );
    case "my-profile":
      return (
        <>
          <div className="hidden lg:block">My Profile</div>
          <div className="lg:hidden">Profile</div>
        </>
      );
    case "league-info":
      return (
        <>
          <div className="hidden lg:block">League Info</div>
          <div className="lg:hidden">Info</div>
        </>
      );
  }
}

function LeagueDropdownMenu({ chosenLeague }: { chosenLeague: ChosenLeague }) {
  const leaderboardHref = `/league/${chosenLeague.league_id}/leaderboard`;
  const pickHref = `/league/${chosenLeague.league_id}/pick`;
  const adminHref = `/league/${chosenLeague.league_id}/admin`;
  const myProfileHref = `/league/${chosenLeague.league_id}/my-profile`;
  const infoHref = `/league/${chosenLeague.league_id}/info`;

  const { data: session } = clientApi.session.current.useQuery();
  const isAdmin =
    session?.dbUser?.leaguemembers?.find(
      (m) => m.league_id === chosenLeague.league_id,
    )?.role === MemberRole.admin;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost">
            <div className="flex flex-row items-center gap-2">
              <TabLabel />
              <ChevronsUpDown className="h-3 w-3" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>{chosenLeague.name}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <Link href={`/league/${chosenLeague.league_id}`} prefetch>
            <DropdownMenuItem>
              <div className="flex flex-row items-center gap-3">
                <HomeIcon className="h-4 w-4" />
                <>League Home</>
              </div>
            </DropdownMenuItem>
          </Link>
          <Link href={pickHref} prefetch>
            <DropdownMenuItem>
              <div className="flex flex-row items-center gap-3">
                <PenIcon className="h-4 w-4" />
                <>Make Picks</>
              </div>
            </DropdownMenuItem>
          </Link>
          <Link href={leaderboardHref} prefetch>
            <DropdownMenuItem>
              <div className="flex flex-row items-center gap-3">
                <TrophyIcon className="h-4 w-4" />
                <>Leaderboard</>
              </div>
            </DropdownMenuItem>
          </Link>
          <DropdownMenuSeparator />
          <Link href={myProfileHref} prefetch>
            <DropdownMenuItem>
              <div className="flex flex-row items-center gap-3">
                <CircleUser className="h-4 w-4" />
                <>My Profile</>
              </div>
            </DropdownMenuItem>
          </Link>
          <Link href={infoHref} prefetch>
            <DropdownMenuItem>
              <div className="flex items-center gap-3">
                <InfoIcon className="h-4 w-4" />
                <>League Info</>
              </div>
            </DropdownMenuItem>
          </Link>
          {isAdmin && (
            <Link href={adminHref} prefetch>
              <DropdownMenuItem>
                <div className="flex flex-row items-center gap-3">
                  <SettingsIcon className="h-4 w-4" />
                  <>Admin Settings</>
                </div>
              </DropdownMenuItem>
            </Link>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
