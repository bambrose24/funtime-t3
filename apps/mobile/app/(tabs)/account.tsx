import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { supabase } from "@/lib/supabase/client";
import type { Session } from "@supabase/supabase-js";
import { clientApi } from "@/lib/trpc/react";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";

export default function AccountScreen() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const colorScheme = useColorScheme();

  // Get user data from tRPC
  const { data: userData, isLoading: userLoading } =
    clientApi.session.current.useQuery(undefined, {
      enabled: !!session,
    });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert("Success", "Logged in successfully!");
      setEmail("");
      setPassword("");
    }
    setLoading(false);
  };

  const signOut = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert("Error", error.message);
    }
    setLoading(false);
  };

  const renderLoginForm = () => (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          Welcome to Funtime
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Please sign in to continue
        </ThemedText>

        <View style={styles.inputContainer}>
          <Text
            style={[
              styles.label,
              { color: Colors[colorScheme ?? "light"].text },
            ]}
          >
            Email
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                borderColor: Colors[colorScheme ?? "light"].icon,
                color: Colors[colorScheme ?? "light"].text,
                backgroundColor: Colors[colorScheme ?? "light"].background,
              },
            ]}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            placeholderTextColor={Colors[colorScheme ?? "light"].icon}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text
            style={[
              styles.label,
              { color: Colors[colorScheme ?? "light"].text },
            ]}
          >
            Password
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                borderColor: Colors[colorScheme ?? "light"].icon,
                color: Colors[colorScheme ?? "light"].text,
                backgroundColor: Colors[colorScheme ?? "light"].background,
              },
            ]}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            placeholderTextColor={Colors[colorScheme ?? "light"].icon}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: Colors[colorScheme ?? "light"].tint },
          ]}
          onPress={signIn}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Signing in..." : "Sign In"}
          </Text>
        </TouchableOpacity>

        <ThemedText style={styles.helpText}>
          Don't have an account? Contact your league administrator to get
          access.
        </ThemedText>
      </ThemedView>
    </ScrollView>
  );

  const renderUserProfile = () => (
    <ScrollView style={styles.container}>
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
  );

  return session ? renderUserProfile() : renderLoginForm();
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
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
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
