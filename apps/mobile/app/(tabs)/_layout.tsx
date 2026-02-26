import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColorScheme } from "@/lib/useColorScheme";

type TabIconName = "home" | "football" | "person";

const iconMap: Record<TabIconName, { inactive: string; active: string }> = {
  home: { inactive: "home-outline", active: "home" },
  football: { inactive: "american-football-outline", active: "american-football" },
  person: { inactive: "person-outline", active: "person" },
};

export default function TabsLayout() {
  const { isDarkColorScheme } = useColorScheme();
  const insets = useSafeAreaInsets();
  const activeColor = isDarkColorScheme ? "#e5e7eb" : "#111827";
  const inactiveColor = isDarkColorScheme ? "#9ca3af" : "#6b7280";
  const barColor = isDarkColorScheme ? "#18181b" : "#ffffff";
  const borderColor = isDarkColorScheme ? "#27272a" : "#e5e7eb";
  const tabBarTopPadding = 8;
  const tabBarBottomPadding = Math.max(insets.bottom, 10);
  const tabBarHeight = 44 + tabBarTopPadding + tabBarBottomPadding;

  const renderTabIcon = (tab: TabIconName, focused: boolean) => {
    const iconName = focused ? iconMap[tab].active : iconMap[tab].inactive;
    return (
      <Ionicons
        name={iconName as keyof typeof Ionicons.glyphMap}
        size={20}
        color={focused ? activeColor : inactiveColor}
      />
    );
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
        tabBarItemStyle: {
          paddingVertical: 0,
        },
        tabBarStyle: {
          backgroundColor: barColor,
          borderTopColor: borderColor,
          height: tabBarHeight,
          paddingBottom: tabBarBottomPadding,
          paddingTop: tabBarTopPadding,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Leagues",
          tabBarIcon: ({ focused }) => renderTabIcon("home", focused),
        }}
      />
      <Tabs.Screen
        name="pick"
        options={{
          title: "Pick",
          tabBarIcon: ({ focused }) => renderTabIcon("football", focused),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "Account",
          tabBarIcon: ({ focused }) => renderTabIcon("person", focused),
        }}
      />
    </Tabs>
  );
}
