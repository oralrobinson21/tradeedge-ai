import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface InfoBannerProps {
  variant?: "compact" | "full";
  showDismiss?: boolean;
  onDismiss?: () => void;
  onLearnMore?: () => void;
}

const BULLET_POINTS_COMPACT = [
  "You are NEVER charged upfront",
  "Posting a task is 100% free",
  "Helpers can apply for free",
  "Payment is held until both confirm completion",
  "CityTasks keeps 15% of the job amount",
];

const BULLET_POINTS_FULL = [
  "Posting a job is free",
  "Helpers apply for free",
  "You only pay when you select a helper",
  "CityTasks takes 15% of the entire job, including extra charges",
  "Tips always go 100% to the helper",
  "Payment is held until both parties confirm the job is complete",
  "Disputes require photo proof from both sides",
  "CityTasks will review and release or refund funds accordingly",
];

export function InfoBanner({ 
  variant = "compact", 
  showDismiss = false,
  onDismiss,
  onLearnMore 
}: InfoBannerProps) {
  const { theme } = useTheme();

  const bulletPoints = variant === "compact" ? BULLET_POINTS_COMPACT : BULLET_POINTS_FULL;

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: theme.primary + "20" }]}>
          <Feather name="info" size={18} color={theme.primary} />
        </View>
        <View style={styles.titleContainer}>
          <ThemedText type="h4" style={{ color: theme.primary }}>
            How CityTasks Works
          </ThemedText>
        </View>
        {showDismiss && onDismiss ? (
          <Pressable onPress={onDismiss} hitSlop={8}>
            <Feather name="x" size={18} color={theme.textSecondary} />
          </Pressable>
        ) : null}
      </View>

      <ThemedText type="h4" style={[styles.headline, { color: theme.text }]}>
        Posting is free. Accepting is free.
      </ThemedText>
      <ThemedText type="body" style={[styles.subheadline, { color: theme.textSecondary }]}>
        You are only charged when you select a helper.
      </ThemedText>

      <View style={styles.bulletContainer}>
        {bulletPoints.map((point, index) => (
          <View key={index} style={styles.bulletRow}>
            <Feather name="check-circle" size={14} color={theme.success} style={styles.bulletIcon} />
            <ThemedText type="caption" style={{ color: theme.text, flex: 1 }}>
              {point}
            </ThemedText>
          </View>
        ))}
      </View>

      {onLearnMore ? (
        <Pressable 
          onPress={onLearnMore}
          style={[styles.learnMoreButton, { borderColor: theme.border }]}
        >
          <ThemedText type="caption" style={{ color: theme.primary }}>
            Learn more about payments
          </ThemedText>
          <Feather name="chevron-right" size={14} color={theme.primary} />
        </Pressable>
      ) : null}
    </View>
  );
}

export function PaymentReminderNote() {
  const { theme } = useTheme();
  
  return (
    <View style={[styles.noteContainer, { backgroundColor: theme.primary + "15", borderColor: theme.primary + "30" }]}>
      <Feather name="info" size={14} color={theme.primary} style={styles.noteIcon} />
      <ThemedText type="caption" style={{ color: theme.text, flex: 1 }}>
        Posting is free. You only pay when you choose a helper.
      </ThemedText>
    </View>
  );
}

export function CheckoutExplanation() {
  const { theme } = useTheme();
  
  return (
    <View style={[styles.explanationContainer, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
      <View style={styles.explanationRow}>
        <Feather name="lock" size={16} color={theme.success} />
        <ThemedText type="caption" style={{ color: theme.text, flex: 1, marginLeft: Spacing.sm }}>
          Your payment is held securely by CityTasks and only released after both sides confirm the job is done.
        </ThemedText>
      </View>
      <View style={styles.explanationRow}>
        <Feather name="percent" size={16} color={theme.primary} />
        <ThemedText type="caption" style={{ color: theme.text, flex: 1, marginLeft: Spacing.sm }}>
          15% service fee is included in the total shown above.
        </ThemedText>
      </View>
      <View style={styles.explanationRow}>
        <Feather name="heart" size={16} color={theme.primary} />
        <ThemedText type="caption" style={{ color: theme.text, flex: 1, marginLeft: Spacing.sm }}>
          Tips after completion go 100% to the helper.
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  titleContainer: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  headline: {
    marginBottom: Spacing.xs,
  },
  subheadline: {
    marginBottom: Spacing.md,
  },
  bulletContainer: {
    gap: Spacing.sm,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  bulletIcon: {
    marginRight: Spacing.sm,
    marginTop: 2,
  },
  learnMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    gap: Spacing.xs,
  },
  noteContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  noteIcon: {
    marginRight: Spacing.sm,
  },
  explanationContainer: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  explanationRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
});
