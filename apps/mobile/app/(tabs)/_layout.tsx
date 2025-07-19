import { Tabs } from "expo-router";
import React from "react";
import { Platform, useColorScheme } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  // Define theme-aware colors that match our web app exactly
  const tabColors = {
    light: {
      activeTint: "#16a34a", // green-600 to match web primary
      inactiveTint: "#6b7280", // gray-500
      background: "#ffffff", // app-bg-light
    },
    dark: {
      activeTint: "#22c55e", // green-500 for dark mode
      inactiveTint: "#9ca3af", // gray-400
      background: "#0c0a09", // app-bg-dark
    },
  };

  const currentColors = tabColors[colorScheme ?? "light"];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: currentColors.activeTint,
        tabBarInactiveTintColor: currentColors.inactiveTint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            // Removed position: "absolute" for proper layout
            // position: "absolute",
          },
          default: {
            backgroundColor: currentColors.background,
            borderTopColor: colorScheme === "dark" ? "#27272a" : "#e5e7eb", // zinc-800 : gray-200
            borderTopWidth: 1,
          },
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "Account",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="person.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
