import { Bell, CircleUser } from "lucide-react";
import { type ReactNode } from "react";

export const settingsTabIds = ["profile", "notifications"] as const;
export type SettingsTabId = (typeof settingsTabIds)[number];

type SettingsTab = {
  id: SettingsTabId;
  href: string;
  label: string;
  icon: ReactNode;
};

export const settingsTabs: Array<SettingsTab> = [
  {
    id: "profile",
    href: "/settings/profile",
    label: "Profile",
    icon: <CircleUser />,
  },
  {
    id: "notifications",
    href: "/settings/notifications",
    label: "Notifications",
    icon: <Bell />,
  },
];
