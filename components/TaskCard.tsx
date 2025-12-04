import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { StatusBadge } from "@/components/StatusBadge";
import { EmergencyBadge, EmergencyTimeBadge } from "@/components/EmergencyBadge";
import { ExpirationBadge } from "@/components/ExpirationBadge";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { Task, getCategoryLabel } from "@/types";

interface TaskCardProps {
  task: Task;
  isCustomerView: boolean;
  onPress: () => void;
}

const springConfig: WithSpringConfig = {
  damping: 15,
  mass: 0.3,
  stiffness: 150,
  overshootClamping: true,
  energyThreshold: 0.001,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function TaskCard({ task, isCustomerView, onPress }: TaskCardProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, springConfig);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springConfig);
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.card,
        { backgroundColor: theme.backgroundDefault },
        animatedStyle,
      ]}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <ThemedText type="h4" style={styles.title} numberOfLines={1}>
            {task.title}
          </ThemedText>
          {task.isEmergency ? <EmergencyBadge size="small" /> : null}
        </View>
        <StatusBadge status={task.status} />
      </View>

      <View style={styles.metaRow}>
        <Feather name="map-pin" size={14} color={theme.textSecondary} />
        <ThemedText type="caption" style={{ color: theme.textSecondary, flex: 1 }} numberOfLines={1}>
          {task.areaDescription || task.zipCode}
        </ThemedText>
        <ExpirationBadge task={task} compact />
      </View>

      <View style={styles.priceRow}>
        <ThemedText type="h3" style={{ color: task.isEmergency ? theme.error : theme.primary }}>
          ${task.price.toFixed(0)}
        </ThemedText>
        <View style={styles.categoryRow}>
          {task.isEmergency ? (
            <EmergencyTimeBadge />
          ) : (
            <>
              <Feather name="tag" size={14} color={theme.textSecondary} />
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                {getCategoryLabel(task.category)}
              </ThemedText>
            </>
          )}
        </View>
      </View>

      <ThemedText 
        type="small" 
        style={[styles.description, { color: theme.textSecondary }]} 
        numberOfLines={2}
      >
        {task.description}
      </ThemedText>

      {!isCustomerView && task.status === "paid_waiting" ? (
        <View style={[styles.fundedIndicator, { backgroundColor: theme.funded }]}>
          <Feather name="check-circle" size={14} color={theme.fundedText} />
          <ThemedText type="caption" style={{ color: theme.fundedText, fontWeight: "600" }}>
            Funded - Ready to accept
          </ThemedText>
        </View>
      ) : null}

      {task.status === "assigned" && task.helperName ? (
        <View style={[styles.assignedIndicator, { backgroundColor: theme.assigned }]}>
          <Feather name="user" size={14} color={theme.assignedText} />
          <ThemedText type="caption" style={{ color: theme.assignedText }}>
            {isCustomerView ? `Helper: ${task.helperName}` : "You accepted this job"}
          </ThemedText>
        </View>
      ) : null}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: Spacing.sm,
  },
  title: {
    flex: 1,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  description: {
    marginBottom: Spacing.sm,
  },
  fundedIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.sm,
  },
  assignedIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.sm,
  },
});
