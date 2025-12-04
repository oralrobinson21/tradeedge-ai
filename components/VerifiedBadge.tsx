import React from "react";
import { View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";

interface VerifiedBadgeProps {
  size?: "small" | "medium" | "large";
  showLabel?: boolean;
}

const SIZES = {
  small: 14,
  medium: 18,
  large: 22,
};

export function VerifiedBadge({ size = "small", showLabel = false }: VerifiedBadgeProps) {
  const { theme } = useTheme();
  const iconSize = SIZES[size];
  const badgeColor = theme.primary;
  
  return (
    <View style={styles.container}>
      <View style={[styles.badge, { 
        width: iconSize + 4, 
        height: iconSize + 4, 
        borderRadius: (iconSize + 4) / 2,
        backgroundColor: badgeColor,
      }]}>
        <Feather name="check" size={iconSize - 4} color="#FFFFFF" />
      </View>
      {showLabel ? (
        <ThemedText type="caption" style={{ color: badgeColor, marginLeft: Spacing.xs, fontWeight: "600" }}>
          Verified
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 4,
  },
  badge: {
    alignItems: "center",
    justifyContent: "center",
  },
});
