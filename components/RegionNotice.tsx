import React from "react";
import { View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface RegionNoticeProps {
  variant?: "inline" | "card";
}

export function RegionNotice({ variant = "card" }: RegionNoticeProps) {
  const { theme } = useTheme();

  if (variant === "inline") {
    return (
      <View style={styles.inlineContainer}>
        <Feather name="map-pin" size={12} color={theme.textSecondary} />
        <ThemedText type="caption" style={{ color: theme.textSecondary, flex: 1 }}>
          For best results, post tasks in NYC, Yonkers, or North New Jersey (Newark, Jersey City, Hoboken, etc.)
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={[styles.cardContainer, { backgroundColor: theme.secondary + "10", borderColor: theme.secondary + "30" }]}>
      <View style={[styles.iconContainer, { backgroundColor: theme.secondary }]}>
        <Feather name="map-pin" size={16} color="#FFFFFF" />
      </View>
      <View style={{ flex: 1 }}>
        <ThemedText type="body" style={{ fontWeight: "600" }}>
          NYC & North Jersey Focus
        </ThemedText>
        <ThemedText type="caption" style={{ color: theme.textSecondary, marginTop: Spacing.xs }}>
          CityTasks is currently focused on the NYC & North New Jersey metro area. You can still post from anywhere, but matches will be fastest in this region.
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: "row",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  inlineContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
});
