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
import { supabase } from "@/lib/supabase/client";
import { clientApi } from "@/lib/trpc/react";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";

export default function AccountScreen() {
  const [loading, setLoading] = useState(false);
  const colorScheme = useColorScheme();

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
      <ScrollView>
        <ThemedView style={styles.content}>
          <ThemedText type="title" style={styles.title}>
            Account
          </ThemedText>

          {userLoading ? (
            <ThemedText>Loading user data...</ThemedText>
          ) : userData?.dbUser ? (
            <View>
              <View style={styles.userInfo}>
                <ThemedText type="subtitle">Profile Information</ThemedText>
                <Text
                  style={[
                    styles.userDetail,
                    { color: Colors[colorScheme ?? "light"].text },
                  ]}
                >
                  Name: {userData.dbUser.fname} {userData.dbUser.lname}
                </Text>
                <Text
                  style={[
                    styles.userDetail,
                    { color: Colors[colorScheme ?? "light"].text },
                  ]}
                >
                  Username: {userData.dbUser.username}
                </Text>
                <Text
                  style={[
                    styles.userDetail,
                    { color: Colors[colorScheme ?? "light"].text },
                  ]}
                >
                  Email: {userData.dbUser.email}
                </Text>
              </View>

              {userData.dbUser.leaguemembers &&
                userData.dbUser.leaguemembers.length > 0 && (
                  <View style={styles.leaguesInfo}>
                    <ThemedText type="subtitle">Your Leagues</ThemedText>
                    {userData.dbUser.leaguemembers.map((member, index) => (
                      <Text
                        key={index}
                        style={[
                          styles.leagueItem,
                          { color: Colors[colorScheme ?? "light"].text },
                        ]}
                      >
                        • {member.leagues.name} ({member.leagues.season})
                      </Text>
                    ))}
                  </View>
                )}
            </View>
          ) : (
            <ThemedText>
              No user data found. You may need to complete your profile setup.
            </ThemedText>
          )}

          <TouchableOpacity
            style={[styles.button, styles.signOutButton]}
            onPress={signOut}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Signing out..." : "Sign Out"}
            </Text>
          </TouchableOpacity>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 30,
    opacity: 0.8,
  },

  button: {
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 20,
  },
  signOutButton: {
    backgroundColor: "#dc3545",
    marginTop: 30,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  helpText: {
    textAlign: "center",
    marginTop: 20,
    opacity: 0.7,
    fontSize: 14,
  },
  userInfo: {
    marginBottom: 30,
  },
  userDetail: {
    fontSize: 16,
    marginBottom: 8,
    paddingVertical: 4,
  },
  leaguesInfo: {
    marginBottom: 20,
  },
  leagueItem: {
    fontSize: 14,
    marginBottom: 4,
    paddingLeft: 10,
  },
});
