import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { supabase } from "@/lib/supabase/client";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";

export default function AuthScreen() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const colorScheme = useColorScheme();

  // Environment variables are loaded correctly

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    setLoading(true);

    try {
      const authAction = isSignUp
        ? supabase.auth.signUp({ email, password })
        : supabase.auth.signInWithPassword({ email, password });

      const { error, data } = await authAction;

      if (error) {
        Alert.alert("Error", error.message);
      } else {
        const successMessage = isSignUp
          ? "Account created! Please check your email to verify your account."
          : "Logged in successfully!";
        Alert.alert("Success", successMessage);
        setEmail("");
        setPassword("");
      }
    } catch (error) {
      console.log("Auth error:", error);
      Alert.alert("Error", "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <ThemedView style={styles.content}>
          <ThemedText type="title" style={styles.title}>
            Welcome to Funtime
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            {isSignUp ? "Create your account" : "Please sign in to continue"}
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
            onPress={handleAuth}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading
                ? isSignUp
                  ? "Creating Account..."
                  : "Signing in..."
                : isSignUp
                  ? "Sign Up"
                  : "Sign In"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => setIsSignUp(!isSignUp)}
            disabled={loading}
          >
            <ThemedText style={styles.switchText}>
              {isSignUp
                ? "Already have an account? Sign In"
                : "Don't have an account? Sign Up"}
            </ThemedText>
          </TouchableOpacity>

          {!isSignUp && (
            <ThemedText style={styles.helpText}>
              Need access? Contact your league administrator.
            </ThemedText>
          )}
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    minHeight: "100%",
  },
  title: {
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 40,
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
  buttonText: {
    color: "black",
    fontSize: 16,
    fontWeight: "600",
  },
  switchButton: {
    marginTop: 20,
    padding: 10,
  },
  switchText: {
    textAlign: "center",
    textDecorationLine: "underline",
  },
  helpText: {
    textAlign: "center",
    marginTop: 30,
    opacity: 0.7,
    fontSize: 14,
  },
});
