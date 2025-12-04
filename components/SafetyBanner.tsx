import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface SafetyBannerProps {
  variant?: "chat" | "payment" | "fraud" | "task";
  showDismiss?: boolean;
  onDismiss?: () => void;
}

const MESSAGES = {
  chat: "For your safety, keep all communication and payments inside CityTasks. Never send money off-app.",
  payment: "Payments are secured by Stripe. Funds are held until both parties confirm job completion.",
  fraud: "Never pay in cash or send money outside the app. If someone asks to be paid off-platform, it violates our terms and you may lose protection.",
  task: "Meet in public when possible. Share your location with someone you trust for in-home jobs.",
};

const ICONS = {
  chat: "shield",
  payment: "lock",
  fraud: "alert-triangle",
  task: "map-pin",
};

export function SafetyBanner({ variant = "chat", showDismiss, onDismiss }: SafetyBannerProps) {
  const { theme } = useTheme();
  const message = MESSAGES[variant];
  const icon = ICONS[variant];
  const isWarning = variant === "fraud";

  return (
    <View style={[
      styles.container, 
      { 
        backgroundColor: isWarning ? theme.error + "10" : theme.primary + "10",
        borderColor: isWarning ? theme.error + "30" : theme.primary + "30",
      }
    ]}>
      <Feather 
        name={icon as any} 
        size={14} 
        color={isWarning ? theme.error : theme.primary} 
      />
      <ThemedText type="caption" style={{ color: theme.textSecondary, flex: 1 }}>
        {message}
      </ThemedText>
      {showDismiss && onDismiss ? (
        <Pressable onPress={onDismiss} hitSlop={8}>
          <Feather name="x" size={14} color={theme.textSecondary} />
        </Pressable>
      ) : null}
    </View>
  );
}

export function ChatSafetyNotice() {
  const { theme } = useTheme();

  return (
    <View style={[styles.chatNotice, { backgroundColor: theme.backgroundDefault }]}>
      <Feather name="shield" size={12} color={theme.textSecondary} />
      <ThemedText type="small" style={{ color: theme.textSecondary }}>
        Keep payments on CityTasks for protection
      </ThemedText>
    </View>
  );
}

export function FraudWarningCard() {
  const { theme } = useTheme();

  return (
    <View style={[styles.fraudCard, { backgroundColor: theme.error + "08", borderColor: theme.error + "25" }]}>
      <View style={styles.fraudHeader}>
        <Feather name="alert-triangle" size={16} color={theme.error} />
        <ThemedText type="body" style={[styles.fraudTitle, { color: theme.error }]}>
          Avoid Scams
        </ThemedText>
      </View>
      <View style={styles.fraudList}>
        <View style={styles.fraudItem}>
          <Feather name="x-circle" size={12} color={theme.error} />
          <ThemedText type="small" style={{ color: theme.text, flex: 1 }}>
            Never pay outside CityTasks
          </ThemedText>
        </View>
        <View style={styles.fraudItem}>
          <Feather name="x-circle" size={12} color={theme.error} />
          <ThemedText type="small" style={{ color: theme.text, flex: 1 }}>
            Never share bank or card details in chat
          </ThemedText>
        </View>
        <View style={styles.fraudItem}>
          <Feather name="x-circle" size={12} color={theme.error} />
          <ThemedText type="small" style={{ color: theme.text, flex: 1 }}>
            Never send gift cards or wire transfers
          </ThemedText>
        </View>
        <View style={styles.fraudItem}>
          <Feather name="x-circle" size={12} color={theme.error} />
          <ThemedText type="small" style={{ color: theme.text, flex: 1 }}>
            Report anyone who pressures you to go off-app
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  chatNotice: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
    gap: Spacing.xs,
    alignSelf: "center",
  },
  fraudCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginVertical: Spacing.md,
  },
  fraudHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
    gap: Spacing.xs,
  },
  fraudTitle: {
    fontWeight: "600",
  },
  fraudList: {
    gap: Spacing.xs,
  },
  fraudItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
});
