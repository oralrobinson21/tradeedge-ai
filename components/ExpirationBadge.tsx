import React from "react";
import { View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { Task, getDaysUntilExpiration, isTaskExpired } from "@/types";

interface ExpirationBadgeProps {
  task: Task;
  compact?: boolean;
}

export function ExpirationBadge({ task, compact = false }: ExpirationBadgeProps) {
  const { theme } = useTheme();
  
  const expired = isTaskExpired(task);
  const daysLeft = getDaysUntilExpiration(task);
  
  if (task.status !== "requested") {
    return null;
  }
  
  if (expired) {
    return (
      <View style={[styles.badge, styles.expiredBadge, { backgroundColor: theme.error + "20" }]}>
        <Feather name="clock" size={compact ? 10 : 12} color={theme.error} />
        <ThemedText 
          type={compact ? "small" : "caption"} 
          style={[styles.text, { color: theme.error }]}
        >
          Expired
        </ThemedText>
      </View>
    );
  }
  
  const isUrgent = daysLeft <= 1;
  const bgColor = isUrgent ? theme.warning + "20" : theme.textSecondary + "15";
  const textColor = isUrgent ? theme.warning : theme.textSecondary;
  
  return (
    <View style={[styles.badge, { backgroundColor: bgColor }]}>
      <Feather name="clock" size={compact ? 10 : 12} color={textColor} />
      <ThemedText 
        type={compact ? "small" : "caption"} 
        style={[styles.text, { color: textColor }]}
      >
        {daysLeft <= 0 ? "Expires today" : daysLeft === 1 ? "1 day left" : `${daysLeft} days left`}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  expiredBadge: {},
  text: {
    fontWeight: "500",
  },
});
