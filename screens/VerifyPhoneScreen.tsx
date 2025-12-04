import React, { useState, useRef, useEffect } from "react";
import { View, StyleSheet, Pressable, TextInput, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ThemedText } from "@/components/ThemedText";
import { ScreenKeyboardAwareScrollView } from "@/components/ScreenKeyboardAwareScrollView";
import { useTheme } from "@/hooks/useTheme";
import { useApp } from "@/context/AppContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/types";

type VerifyPhoneScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

export default function VerifyPhoneScreen({ navigation }: VerifyPhoneScreenProps) {
  const { theme } = useTheme();
  const { user, verifyPhone, updatePhone } = useApp();
  const [phone, setPhone] = useState(user?.phone || "");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setResendDisabled(false);
    }
  }, [countdown]);

  const handleSendCode = async () => {
    if (!phone || phone.length < 10) {
      Alert.alert("Invalid Phone", "Please enter a valid phone number.");
      return;
    }

    setIsLoading(true);
    try {
      await updatePhone(phone);
      setCodeSent(true);
      setResendDisabled(true);
      setCountdown(30);
      Alert.alert("Code Sent", "A verification code has been sent to your phone.");
    } catch (error) {
      Alert.alert("Error", "Failed to send verification code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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
    if (otpCode.length !== 6) {
      Alert.alert("Invalid Code", "Please enter a 6-digit verification code.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await verifyPhone(otpCode);
      if (result.success) {
        Alert.alert("Success", "Your phone number has been verified!", [
          { text: "OK", onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert("Verification Failed", result.message);
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

  return (
    <ScreenKeyboardAwareScrollView>
      <View style={styles.header}>
        <Pressable 
          onPress={() => navigation.goBack()} 
          style={[styles.backButton, { backgroundColor: theme.backgroundDefault }]}
        >
          <Feather name="arrow-left" size={20} color={theme.text} />
        </Pressable>
        <ThemedText type="h2">Verify Phone</ThemedText>
      </View>

      <View style={[styles.infoCard, { backgroundColor: theme.primary + "10", borderColor: theme.primary + "30" }]}>
        <View style={[styles.iconContainer, { backgroundColor: theme.primary }]}>
          <Feather name="phone" size={24} color="#FFFFFF" />
        </View>
        <ThemedText type="body" style={{ textAlign: "center", marginTop: Spacing.md }}>
          Verify your phone number to unlock higher-value tasks (over $40) and build trust with other users.
        </ThemedText>
      </View>

      {!codeSent ? (
        <View style={styles.phoneSection}>
          <ThemedText type="body" style={{ marginBottom: Spacing.sm }}>
            Enter your phone number:
          </ThemedText>
          <TextInput
            style={[styles.phoneInput, { 
              backgroundColor: theme.backgroundDefault, 
              borderColor: theme.border,
              color: theme.text 
            }]}
            value={phone}
            onChangeText={setPhone}
            placeholder="(555) 123-4567"
            placeholderTextColor={theme.textSecondary}
            keyboardType="phone-pad"
            autoFocus
          />

          <Pressable
            style={[styles.sendButton, { backgroundColor: theme.primary, opacity: isLoading ? 0.6 : 1 }]}
            onPress={handleSendCode}
            disabled={isLoading}
          >
            <ThemedText type="body" style={{ color: "#FFFFFF", fontWeight: "600" }}>
              {isLoading ? "Sending..." : "Send Verification Code"}
            </ThemedText>
          </Pressable>
        </View>
      ) : (
        <View style={styles.codeSection}>
          <View style={[styles.phoneDisplay, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>Sending code to</ThemedText>
            <ThemedText type="body" style={{ fontWeight: "600" }}>{phone}</ThemedText>
          </View>

          <ThemedText type="body" style={{ marginBottom: Spacing.sm }}>
            Enter the 6-digit verification code:
          </ThemedText>
          
          <View style={[styles.mockNotice, { backgroundColor: theme.backgroundSecondary }]}>
            <Feather name="info" size={16} color={theme.textSecondary} />
            <ThemedText type="caption" style={{ color: theme.textSecondary, flex: 1, marginLeft: Spacing.sm }}>
              For testing, enter 123456 to simulate a successful verification.
            </ThemedText>
          </View>

          <View style={styles.codeInputContainer}>
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={ref => { inputRefs.current[index] = ref; }}
                style={[
                  styles.codeBox,
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
              <Pressable onPress={handleSendCode}>
                <ThemedText type="body" style={{ color: theme.primary, fontWeight: "600" }}>
                  Resend
                </ThemedText>
              </Pressable>
            )}
          </View>
        </View>
      )}

      <View style={styles.benefitsList}>
        <ThemedText type="h4" style={{ marginBottom: Spacing.md }}>Benefits of verification:</ThemedText>
        
        <View style={styles.benefitItem}>
          <View style={[styles.checkIcon, { backgroundColor: theme.success + "20" }]}>
            <Feather name="check" size={14} color={theme.success} />
          </View>
          <ThemedText type="body" style={{ flex: 1 }}>Post and accept tasks over $40</ThemedText>
        </View>
        
        <View style={styles.benefitItem}>
          <View style={[styles.checkIcon, { backgroundColor: theme.success + "20" }]}>
            <Feather name="check" size={14} color={theme.success} />
          </View>
          <ThemedText type="body" style={{ flex: 1 }}>Blue verified badge on your profile</ThemedText>
        </View>
        
        <View style={styles.benefitItem}>
          <View style={[styles.checkIcon, { backgroundColor: theme.success + "20" }]}>
            <Feather name="check" size={14} color={theme.success} />
          </View>
          <ThemedText type="body" style={{ flex: 1 }}>Build more trust with other users</ThemedText>
        </View>

        <View style={styles.benefitItem}>
          <View style={[styles.checkIcon, { backgroundColor: theme.success + "20" }]}>
            <Feather name="check" size={14} color={theme.success} />
          </View>
          <ThemedText type="body" style={{ flex: 1 }}>Higher job stacking limits as a helper</ThemedText>
        </View>

        <View style={styles.benefitItem}>
          <View style={[styles.checkIcon, { backgroundColor: theme.success + "20" }]}>
            <Feather name="check" size={14} color={theme.success} />
          </View>
          <ThemedText type="body" style={{ flex: 1 }}>Posters can contact you directly after hiring</ThemedText>
        </View>
      </View>
    </ScreenKeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  infoCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.xl,
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  phoneSection: {
    marginBottom: Spacing.xl,
  },
  phoneInput: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.lg,
    fontSize: 18,
    marginBottom: Spacing.lg,
  },
  sendButton: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: "center",
  },
  phoneDisplay: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  codeSection: {
    marginBottom: Spacing.xl,
  },
  mockNotice: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  codeInputContainer: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
    justifyContent: "center",
  },
  codeBox: {
    width: 48,
    height: 56,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "600",
  },
  loadingText: {
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  resendContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  benefitsList: {
    marginBottom: Spacing.xl,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  checkIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
});
