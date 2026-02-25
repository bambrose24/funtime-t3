import { Redirect } from "expo-router";

export default function LoginRedirectScreen() {
  return <Redirect href={"/auth" as any} />;
}
