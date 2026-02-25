import { Redirect } from "expo-router";

export default function SettingsRedirectScreen() {
  return <Redirect href={"/account" as any} />;
}
