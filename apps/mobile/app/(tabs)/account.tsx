import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase/client";
import { clientApi } from "@/lib/trpc/react";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

export default function AccountScreen() {
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  // Get user data from tRPC - will only be called if user is authenticated
  const { data: userData, isLoading: userLoading } =
    clientApi.session.current.useQuery();

  const signOut = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert("Error", error.message);
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>
          Account
        </ThemedText>
      </ThemedView>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <ThemedView style={styles.content}>
          {userLoading ? (
            <View style={styles.loadingContainer}>
              <ThemedText style={styles.loadingText}>
                Loading your profile...
              </ThemedText>
            </View>
          ) : userData?.dbUser ? (
            <View style={styles.profileSection}>
              <View style={styles.profileField}>
                <ThemedText style={styles.fieldLabel}>First Name</ThemedText>
                <ThemedText style={styles.fieldValue}>
                  {userData.dbUser.fname}
                </ThemedText>
              </View>

              <View style={styles.profileField}>
                <ThemedText style={styles.fieldLabel}>Last Name</ThemedText>
                <ThemedText style={styles.fieldValue}>
                  {userData.dbUser.lname}
                </ThemedText>
              </View>

              <View style={styles.profileField}>
                <ThemedText style={styles.fieldLabel}>Username</ThemedText>
                <ThemedText style={styles.fieldValue}>
                  @{userData.dbUser.username}
                </ThemedText>
              </View>

              <View style={styles.profileField}>
                <ThemedText style={styles.fieldLabel}>Email</ThemedText>
                <ThemedText style={styles.fieldValue}>
                  {userData.dbUser.email}
                </ThemedText>
              </View>
            </View>
          ) : (
            <View style={styles.errorContainer}>
              <ThemedText style={styles.errorText}>
                Unable to load profile data. Please try signing in again.
              </ThemedText>
            </View>
          )}
        </ThemedView>
      </ScrollView>

      <ThemedView
        style={[styles.footer, { paddingBottom: insets.bottom || 20 }]}
      >
        <TouchableOpacity
          style={[styles.signOutButton, { opacity: loading ? 0.6 : 1 }]}
          onPress={signOut}
          disabled={loading}
        >
          <Text style={styles.signOutButtonText}>
            {loading ? "Signing out..." : "Sign Out"}
          </Text>
        </TouchableOpacity>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    opacity: 0.7,
  },
  profileSection: {
    gap: 24,
  },
  profileField: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    opacity: 0.6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  fieldValue: {
    fontSize: 18,
    fontWeight: "500",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    opacity: 0.7,
    lineHeight: 22,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  signOutButton: {
    backgroundColor: "#dc3545",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  signOutButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
