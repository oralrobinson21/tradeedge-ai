import React from "react";
import { View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { TaskStatus } from "@/types";

interface StatusBadgeProps {
  status: TaskStatus;
  size?: "small" | "normal";
}

export function StatusBadge({ status, size = "small" }: StatusBadgeProps) {
  const { theme } = useTheme();

  const getStatusConfig = () => {
    switch (status) {
      case "paid_waiting":
        return {
          label: "Funded",
          backgroundColor: theme.funded,
          textColor: theme.fundedText,
          icon: "check-circle" as const,
        };
      case "assigned":
        return {
          label: "Assigned",
          backgroundColor: theme.assigned,
          textColor: theme.assignedText,
          icon: "user" as const,
        };
      case "worker_marked_done":
        return {
          label: "Reviewing",
          backgroundColor: theme.assigned,
          textColor: theme.assignedText,
          icon: "eye" as const,
        };
      case "completed":
        return {
          label: "Done",
          backgroundColor: theme.completed,
          textColor: theme.completedText,
          icon: "check" as const,
        };
      case "disputed":
        return {
          label: "Disputed",
          backgroundColor: "#FFA500",
          textColor: "#FFFFFF",
          icon: "alert-circle" as const,
        };
      case "unpaid":
      default:
        return {
          label: "Unpaid",
          backgroundColor: theme.backgroundSecondary,
          textColor: theme.textSecondary,
          icon: "clock" as const,
        };
    }
  };

  const config = getStatusConfig();
  const isSmall = size === "small";

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: config.backgroundColor },
        isSmall && styles.badgeSmall,
      ]}
    >
      <Feather 
        name={config.icon} 
        size={isSmall ? 10 : 12} 
        color={config.textColor} 
      />
      <ThemedText
        type="caption"
        style={[
          styles.text,
          { color: config.textColor },
          isSmall && styles.textSmall,
        ]}
      >
        {config.label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  badgeSmall: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  text: {
    fontWeight: "600",
    fontSize: 12,
  },
  textSmall: {
    fontSize: 11,
  },
});
