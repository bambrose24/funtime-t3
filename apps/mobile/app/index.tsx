import { Redirect } from "expo-router";

export default function BootstrapIndexScreen() {
  return <Redirect href={"/home" as any} />;
}
