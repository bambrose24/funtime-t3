import { Image } from "expo-image";
import { Platform, ScrollView, View, Text, SafeAreaView } from "react-native";

import { HelloWave } from "@/components/HelloWave";

export default function HomeScreen() {
  return (
    <SafeAreaView className="bg-app-bg-light dark:bg-app-bg-dark flex-1">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Header with logo - simplified without blue background */}
        <View className="relative mb-8 h-64 items-center justify-center bg-gray-50 dark:bg-zinc-900">
          <Image
            source={require("@/assets/images/partial-react-logo.png")}
            style={{
              height: 178,
              width: 290,
              position: "absolute",
              bottom: 0,
              left: 0,
            }}
          />
        </View>

        {/* Content */}
        <View className="px-6">
          {/* Title */}
          <View className="mb-8 flex-row items-center gap-2">
            <Text className="text-app-fg-light dark:text-app-fg-dark text-3xl font-bold">
              Welcome!
            </Text>
            <HelloWave />
          </View>

          {/* Step 1 */}
          <View className="mb-6 gap-2">
            <Text className="text-app-fg-light dark:text-app-fg-dark mb-2 text-xl font-bold">
              Step 1: Try it
            </Text>
            <Text className="text-base leading-6 text-gray-700 dark:text-gray-300">
              Edit{" "}
              <Text className="text-app-fg-light dark:text-app-fg-dark font-semibold">
                app/(tabs)/index.tsx
              </Text>{" "}
              to see changes. Press{" "}
              <Text className="text-app-fg-light dark:text-app-fg-dark font-semibold">
                {Platform.select({
                  ios: "cmd + d",
                  android: "cmd + m",
                  web: "F12",
                })}
              </Text>{" "}
              to open developer tools.
            </Text>
          </View>

          {/* Step 2 */}
          <View className="mb-6 gap-2">
            <Text className="text-app-fg-light dark:text-app-fg-dark mb-2 text-xl font-bold">
              Step 2: Explore
            </Text>
            <Text className="text-base leading-6 text-gray-700 dark:text-gray-300">
              Tap the Explore tab to learn more about what's included in this
              starter app.
            </Text>
          </View>

          {/* Step 3 */}
          <View className="mb-6 gap-2">
            <Text className="text-app-fg-light dark:text-app-fg-dark mb-2 text-xl font-bold">
              Step 3: Get a fresh start
            </Text>
            <Text className="text-base leading-6 text-gray-700 dark:text-gray-300">
              When you're ready, run{" "}
              <Text className="text-app-fg-light dark:text-app-fg-dark font-semibold">
                npm run reset-project
              </Text>{" "}
              to get a fresh{" "}
              <Text className="text-app-fg-light dark:text-app-fg-dark font-semibold">
                app
              </Text>{" "}
              directory. This will move the current{" "}
              <Text className="text-app-fg-light dark:text-app-fg-dark font-semibold">
                app
              </Text>{" "}
              to{" "}
              <Text className="text-app-fg-light dark:text-app-fg-dark font-semibold">
                app-example
              </Text>
              .
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
