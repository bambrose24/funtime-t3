import { Redirect, useLocalSearchParams } from "expo-router";

export default function LoginRedirectScreen() {
  const { redirectTo } = useLocalSearchParams<{ redirectTo?: string }>();
  if (typeof redirectTo === "string" && redirectTo.length > 0) {
    return (
      <Redirect
        href={
          `/auth?redirectTo=${encodeURIComponent(
            (() => {
              try {
                return decodeURIComponent(redirectTo);
              } catch {
                return redirectTo;
              }
            })(),
          )}` as any
        }
      />
    );
  }
  return <Redirect href={"/auth" as any} />;
}
