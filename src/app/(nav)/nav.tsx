import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "~/components/ui/navigation-menu";
import { ClientNav } from "./ClientNav";
import { serverApi } from "~/trpc/server";

export async function Nav() {
  const data = await serverApi.home.nav();

  return <ClientNav data={data} />;
}
