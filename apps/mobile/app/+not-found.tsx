import { Link, Stack } from "expo-router";
import { Linking, Pressable, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

export default function NotFoundScreen() {
  const params = useLocalSearchParams<{ webUrl?: string }>();
  const webUrl =
    typeof params.webUrl === "string" && params.webUrl.startsWith("https://")
      ? params.webUrl
      : null;

  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <ThemedView style={styles.container}>
        <ThemedText type="title">This screen is not available in the app.</ThemedText>
        <ThemedText style={styles.body}>
          {webUrl
            ? "You can open it on the web, or head back home."
            : "Go back home, or open Funtime on the web if you followed a shared link."}
        </ThemedText>
        {webUrl ? (
          <Pressable
            accessibilityRole="link"
            onPress={() => {
              void Linking.openURL(webUrl);
            }}
            style={styles.link}
          >
            <ThemedText type="link">Open on web</ThemedText>
          </Pressable>
        ) : null}
        <Link href="/home" style={styles.link}>
          <ThemedText type="link">Go to home screen</ThemedText>
        </Link>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  body: {
    marginTop: 12,
    textAlign: "center",
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
