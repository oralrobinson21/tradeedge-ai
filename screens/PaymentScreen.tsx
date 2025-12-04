import React, { useState } from "react";
import { View, StyleSheet, TextInput, Pressable, Alert, ActivityIndicator, ScrollView, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import {
  KeyboardAwareScrollView,
} from "react-native-keyboard-controller";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { CheckoutExplanation } from "@/components/InfoBanner";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Typography } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/types";
import { useApp } from "@/context/AppContext";
import { PLATFORM_FEE_PERCENT } from "@/types";

type PaymentScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Payment">;
  route: RouteProp<RootStackParamList, "Payment">;
};

export default function PaymentScreen({ navigation, route }: PaymentScreenProps) {
  const { task } = route.params;
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { syncWithSupabase } = useApp();

  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const fee = task.price * PLATFORM_FEE_PERCENT;
  const total = task.price + fee;

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    const formatted = cleaned.match(/.{1,4}/g)?.join(" ") || cleaned;
    return formatted.substring(0, 19);
  };

  const formatExpiry = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + "/" + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const isValid = cardNumber.replace(/\s/g, "").length === 16 && 
                  expiry.length === 5 && 
                  cvc.length >= 3;

  const handlePayment = async () => {
    if (!isValid || isProcessing) return;
    
    setIsProcessing(true);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      await syncWithSupabase();
      Alert.alert(
        "Payment Successful",
        "Your task has been posted! Helpers can now see and accept your job.",
        [
          {
            text: "View Task",
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: "Main" }],
              });
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert("Payment Failed", "Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const inputStyle = [
    styles.input,
    {
      backgroundColor: theme.backgroundDefault,
      color: theme.text,
      borderColor: theme.border,
    },
  ];

  const ScrollComponent = Platform.OS === "web" ? ScrollView : KeyboardAwareScrollView;

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [styles.headerButton, { opacity: pressed ? 0.7 : 1 }]}
        >
          <Feather name="arrow-left" size={24} color={theme.text} />
        </Pressable>
        <ThemedText type="h4">Payment</ThemedText>
        <View style={styles.headerButton} />
      </View>

      <ScrollComponent 
        style={[styles.scrollView, { backgroundColor: theme.backgroundRoot }]}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.buttonHeight + Spacing["2xl"] }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.summaryCard, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="h4" style={styles.summaryTitle}>
            {task.title}
          </ThemedText>
          <ThemedText type="caption" style={[styles.summaryMeta, { color: theme.textSecondary }]}>
            {task.areaDescription || task.zipCode}
          </ThemedText>
          
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          
          <View style={styles.summaryRow}>
            <ThemedText type="body" style={{ color: theme.textSecondary }}>Task Price</ThemedText>
            <ThemedText type="body">${task.price.toFixed(2)}</ThemedText>
          </View>
          <View style={styles.summaryRow}>
            <ThemedText type="body" style={{ color: theme.textSecondary }}>Service Fee ({PLATFORM_FEE_PERCENT * 100}%)</ThemedText>
            <ThemedText type="body">${fee.toFixed(2)}</ThemedText>
          </View>
          
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          
          <View style={styles.summaryRow}>
            <ThemedText type="h4">Total</ThemedText>
            <ThemedText type="h3" style={{ color: theme.primary }}>${total.toFixed(2)}</ThemedText>
          </View>
        </View>

        <CheckoutExplanation />

        <View style={styles.cardSection}>
          <ThemedText type="h4" style={styles.sectionTitle}>Card Details</ThemedText>
          
          <View style={styles.field}>
            <ThemedText type="small" style={styles.label}>Card Number</ThemedText>
            <TextInput
              style={inputStyle}
              value={cardNumber}
              onChangeText={(text) => setCardNumber(formatCardNumber(text))}
              placeholder="1234 5678 9012 3456"
              placeholderTextColor={theme.textSecondary}
              keyboardType="number-pad"
              maxLength={19}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.field, styles.halfField]}>
              <ThemedText type="small" style={styles.label}>Expiry</ThemedText>
              <TextInput
                style={inputStyle}
                value={expiry}
                onChangeText={(text) => setExpiry(formatExpiry(text))}
                placeholder="MM/YY"
                placeholderTextColor={theme.textSecondary}
                keyboardType="number-pad"
                maxLength={5}
              />
            </View>
            <View style={[styles.field, styles.halfField]}>
              <ThemedText type="small" style={styles.label}>CVC</ThemedText>
              <TextInput
                style={inputStyle}
                value={cvc}
                onChangeText={(text) => setCvc(text.replace(/\D/g, ""))}
                placeholder="123"
                placeholderTextColor={theme.textSecondary}
                keyboardType="number-pad"
                maxLength={4}
                secureTextEntry
              />
            </View>
          </View>

          <View style={[styles.secureNote, { backgroundColor: theme.success + "15" }]}>
            <Feather name="shield" size={16} color={theme.success} />
            <ThemedText type="caption" style={{ color: theme.success, flex: 1 }}>
              Your payment is secured with bank-level encryption
            </ThemedText>
          </View>
        </View>
      </ScrollComponent>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.md, backgroundColor: theme.backgroundRoot }]}>
        <Pressable
          onPress={handlePayment}
          disabled={!isValid || isProcessing}
          style={({ pressed }) => [
            styles.payButton,
            { 
              backgroundColor: theme.primary,
              opacity: !isValid || isProcessing ? 0.5 : pressed ? 0.9 : 1,
            },
          ]}
        >
          {isProcessing ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Feather name="lock" size={20} color="#FFFFFF" />
              <ThemedText type="body" style={styles.payButtonText}>
                Pay ${total.toFixed(2)}
              </ThemedText>
            </>
          )}
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  headerButton: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.xl,
    paddingTop: Spacing.md,
  },
  summaryCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
  },
  summaryTitle: {
    marginBottom: Spacing.xs,
  },
  summaryMeta: {
    marginBottom: Spacing.lg,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.md,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: Spacing.xs,
  },
  cardSection: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
  },
  field: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontWeight: "600",
    marginBottom: Spacing.sm,
  },
  input: {
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.lg,
    fontSize: Typography.body.fontSize,
    borderWidth: 1,
  },
  row: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  halfField: {
    flex: 1,
  },
  secureNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
  },
  payButton: {
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  payButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
