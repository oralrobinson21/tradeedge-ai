import React, { useState } from "react";
import { View, StyleSheet, TextInput, Pressable, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ScreenKeyboardAwareScrollView } from "@/components/ScreenKeyboardAwareScrollView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/types";
import { useApp } from "@/context/AppContext";

type LoginScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Login">;
};

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { sendOTPCode } = useApp();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOTP = async () => {
    if (!email.trim()) {
      Alert.alert("Email Required", "Please enter your email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await sendOTPCode(email.trim().toLowerCase());
      if (result.success) {
        navigation.navigate("Verify", { email: email.trim().toLowerCase() });
      } else {
        Alert.alert("Error", result.message || "Failed to send verification code.");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScreenKeyboardAwareScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.header, { paddingTop: insets.top + Spacing.xl }]}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [
              styles.backButton,
              { backgroundColor: theme.backgroundDefault, opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Feather name="arrow-left" size={24} color={theme.text} />
          </Pressable>
        </View>

        <View style={styles.content}>
          <View style={[styles.iconCircle, { backgroundColor: theme.primary + "20" }]}>
            <Feather name="mail" size={32} color={theme.primary} />
          </View>
          
          <ThemedText type="h2" style={styles.title}>
            Enter your email
          </ThemedText>
          
          <ThemedText type="body" style={[styles.subtitle, { color: theme.textSecondary }]}>
            We'll send you a verification code to sign in or create your account.
          </ThemedText>

          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: theme.backgroundDefault,
                  color: theme.text,
                  borderColor: theme.border,
                },
              ]}
              placeholder="you@example.com"
              placeholderTextColor={theme.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              editable={!isLoading}
            />
          </View>

          <Pressable
            onPress={handleSendOTP}
            disabled={isLoading}
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: theme.primary, opacity: pressed || isLoading ? 0.7 : 1 },
            ]}
          >
            <ThemedText type="body" style={styles.buttonText}>
              {isLoading ? "Sending..." : "Continue"}
            </ThemedText>
            {!isLoading && <Feather name="arrow-right" size={20} color="#FFFFFF" />}
          </Pressable>
        </View>
      </ScreenKeyboardAwareScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing["3xl"],
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
  },
  title: {
    marginBottom: Spacing.sm,
  },
  subtitle: {
    marginBottom: Spacing["2xl"],
  },
  inputContainer: {
    marginBottom: Spacing.xl,
  },
  input: {
    height: 56,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
    borderWidth: 1,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 56,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
