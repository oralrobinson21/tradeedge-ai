import React from "react";
import { View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { LOW_PAY_THRESHOLD_NORMAL, LOW_PAY_THRESHOLD_EMERGENCY } from "@/types";

interface LowPayWarningProps {
  price: number;
  isEmergency: boolean;
}

export function LowPayWarning({ price, isEmergency }: LowPayWarningProps) {
  const { theme } = useTheme();
  
  const threshold = isEmergency ? LOW_PAY_THRESHOLD_EMERGENCY : LOW_PAY_THRESHOLD_NORMAL;
  
  if (price >= threshold) {
    return null;
  }
  
  const message = isEmergency 
    ? "Emergency jobs usually need higher pay. Consider raising by 10-50% for faster responses."
    : "This price might be low. Consider raising it by 10-50% to attract more helpers.";
  
  return (
    <View style={[styles.container, { backgroundColor: theme.warning + "15", borderColor: theme.warning + "40" }]}>
      <Feather name="alert-triangle" size={16} color={theme.warning} />
      <ThemedText type="caption" style={[styles.text, { color: theme.warning }]}>
        {message}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginTop: Spacing.sm,
  },
  text: {
    flex: 1,
    lineHeight: 18,
  },
});
