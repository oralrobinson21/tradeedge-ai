import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useApp } from "@/context/AppContext";
import { Spacing, BorderRadius } from "@/constants/theme";

interface WelcomeBannerProps {
  onLearnMore?: () => void;
}

export function WelcomeBanner({ onLearnMore }: WelcomeBannerProps) {
  const { theme } = useTheme();
  const { bannerDismissed, dismissBanner } = useApp();

  if (bannerDismissed) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.primary + "10", borderColor: theme.primary + "30" }]}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: theme.primary }]}>
          <Feather name="zap" size={18} color="#FFFFFF" />
        </View>
        <ThemedText type="h4" style={{ flex: 1, color: theme.primary }}>
          We're New — And Growing Fast
        </ThemedText>
        <Pressable onPress={dismissBanner} style={styles.closeButton}>
          <Feather name="x" size={18} color={theme.textSecondary} />
        </Pressable>
      </View>

      <ThemedText type="body" style={{ color: theme.textSecondary, marginTop: Spacing.sm }}>
        CityTasks is a brand-new local marketplace. You may see fewer tasks or helpers in your area right now, but we're growing every day.
      </ThemedText>

      <ThemedText type="body" style={{ color: theme.textSecondary, marginTop: Spacing.sm }}>
        Posting is free — and each new task helps build the community.
      </ThemedText>

      {onLearnMore ? (
        <Pressable style={styles.learnMoreButton} onPress={onLearnMore}>
          <ThemedText type="small" style={{ color: theme.primary, fontWeight: "600" }}>
            Learn more
          </ThemedText>
          <Feather name="arrow-right" size={14} color={theme.primary} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButton: {
    padding: Spacing.xs,
  },
  learnMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginTop: Spacing.md,
    alignSelf: "flex-start",
  },
});
