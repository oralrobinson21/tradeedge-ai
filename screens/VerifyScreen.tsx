import React, { useState, useRef, useEffect } from "react";
import { View, StyleSheet, TextInput, Pressable, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ScreenKeyboardAwareScrollView } from "@/components/ScreenKeyboardAwareScrollView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/types";
import { useApp } from "@/context/AppContext";

type VerifyScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Verify">;
  route: RouteProp<RootStackParamList, "Verify">;
};

export default function VerifyScreen({ navigation, route }: VerifyScreenProps) {
  const { email } = route.params;
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { verifyOTPCode, sendOTPCode } = useApp();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(true);
  const [countdown, setCountdown] = useState(30);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setResendDisabled(false);
    }
  }, [countdown]);

  const handleCodeChange = (text: string, index: number) => {
    if (text.length === 6) {
      const digits = text.split("");
      setCode(digits);
      handleVerify(text);
      return;
    }
    
    if (text.length > 1) {
      const pastedDigits = text.replace(/\D/g, "").split("");
      if (pastedDigits.length >= 6) {
        const sixDigits = pastedDigits.slice(0, 6);
        setCode(sixDigits);
        handleVerify(sixDigits.join(""));
        return;
      }
      text = text.slice(-1);
    }
    
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newCode.every(c => c !== "") && newCode.join("").length === 6) {
      handleVerify(newCode.join(""));
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (otpCode: string) => {
    setIsLoading(true);
    try {
      const result = await verifyOTPCode(email, otpCode);
      if (result.success) {
        navigation.reset({
          index: 0,
          routes: [{ name: "Main" }],
        });
      } else {
        Alert.alert("Invalid Code", result.message || "Please check your code and try again.");
        setCode(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again.");
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setResendDisabled(true);
    setCountdown(30);
    
    try {
      const result = await sendOTPCode(email);
      if (result.success) {
        Alert.alert("Code Sent", "A new verification code has been sent to your email.");
      } else {
        Alert.alert("Error", result.message || "Failed to resend code.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to resend code. Please try again.");
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
            <Feather name="shield" size={32} color={theme.primary} />
          </View>
          
          <ThemedText type="h2" style={styles.title}>
            Check your email
          </ThemedText>
          
          <ThemedText type="body" style={[styles.subtitle, { color: theme.textSecondary }]}>
            Enter the 6-digit code sent to{"\n"}{email}
          </ThemedText>

          <View style={[styles.junkMailHint, { backgroundColor: theme.warning + "15" }]}>
            <Feather name="info" size={14} color={theme.warning} />
            <ThemedText type="caption" style={{ color: theme.warning, flex: 1 }}>
              Don't see the email? Check your spam or junk folder.
            </ThemedText>
          </View>

          <View style={styles.codeContainer}>
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={ref => { inputRefs.current[index] = ref; }}
                style={[
                  styles.codeInput,
                  { 
                    backgroundColor: theme.backgroundDefault,
                    color: theme.text,
                    borderColor: digit ? theme.primary : theme.border,
                  },
                ]}
                value={digit}
                onChangeText={text => handleCodeChange(text, index)}
                onKeyPress={e => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                editable={!isLoading}
              />
            ))}
          </View>

          {isLoading ? (
            <ThemedText type="body" style={[styles.loadingText, { color: theme.textSecondary }]}>
              Verifying...
            </ThemedText>
          ) : null}

          <View style={styles.resendContainer}>
            <ThemedText type="body" style={{ color: theme.textSecondary }}>
              Didn't receive the code?{" "}
            </ThemedText>
            {resendDisabled ? (
              <ThemedText type="body" style={{ color: theme.textSecondary }}>
                Resend in {countdown}s
              </ThemedText>
            ) : (
              <Pressable onPress={handleResend}>
                <ThemedText type="body" style={{ color: theme.primary, fontWeight: "600" }}>
                  Resend
                </ThemedText>
              </Pressable>
            )}
          </View>

          <ThemedText type="caption" style={[styles.devNote, { color: theme.textSecondary }]}>
            Dev mode: Check console for OTP code
          </ThemedText>
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
    alignItems: "center",
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
    textAlign: "center",
  },
  subtitle: {
    marginBottom: Spacing.lg,
    textAlign: "center",
  },
  junkMailHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.xl,
  },
  codeContainer: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  codeInput: {
    width: 48,
    height: 56,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "600",
  },
  loadingText: {
    marginBottom: Spacing.lg,
  },
  resendContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.lg,
  },
  devNote: {
    marginTop: Spacing["3xl"],
    fontStyle: "italic",
  },
});
