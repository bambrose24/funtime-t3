export type TabType =
  | "overview"
  | "picks"
  | "leaderboard"
  | "messages"
  | "info"
  | "profile"
  | "superbowl";

export const TAB_KEYS: TabType[] = [
  "overview",
  "picks",
  "leaderboard",
  "messages",
  "info",
  "profile",
  "superbowl",
];

export function parseTabParam(tabParam?: string): TabType {
  if (tabParam && TAB_KEYS.includes(tabParam as TabType)) {
    return tabParam as TabType;
  }
  return "overview";
}
