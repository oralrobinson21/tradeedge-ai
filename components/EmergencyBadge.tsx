import React from "react";
import { View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";

interface EmergencyBadgeProps {
  size?: "small" | "medium" | "large";
  showLabel?: boolean;
}

const SIZES = {
  small: { iconSize: 12, paddingH: Spacing.sm, paddingV: 2 },
  medium: { iconSize: 14, paddingH: Spacing.md, paddingV: 4 },
  large: { iconSize: 16, paddingH: Spacing.lg, paddingV: 6 },
};

export function EmergencyBadge({ size = "small", showLabel = true }: EmergencyBadgeProps) {
  const { theme } = useTheme();
  const sizeConfig = SIZES[size];
  
  return (
    <View style={[
      styles.container, 
      { 
        backgroundColor: theme.error,
        paddingHorizontal: sizeConfig.paddingH,
        paddingVertical: sizeConfig.paddingV,
      }
    ]}>
      <Feather name="alert-circle" size={sizeConfig.iconSize} color="#FFFFFF" />
      {showLabel ? (
        <ThemedText 
          type="caption" 
          style={[
            styles.label,
            size === "large" && { fontSize: 14 },
          ]}
        >
          URGENT
        </ThemedText>
      ) : null}
    </View>
  );
}

export function EmergencyTimeBadge() {
  const { theme } = useTheme();
  
  return (
    <View style={[styles.timeBadge, { backgroundColor: theme.error + "20" }]}>
      <Feather name="clock" size={12} color={theme.error} />
      <ThemedText type="caption" style={{ color: theme.error, fontWeight: "600" }}>
        3-HOUR
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  label: {
    color: "#FFFFFF",
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  timeBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
});
