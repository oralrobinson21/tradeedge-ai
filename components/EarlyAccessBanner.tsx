import React, { useState } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

const STORAGE_KEY = "@citytasks_early_access_dismissed";

interface EarlyAccessBannerProps {
  onLearnMore?: () => void;
}

export function EarlyAccessBanner({ onLearnMore }: EarlyAccessBannerProps) {
  const { theme } = useTheme();
  const [dismissed, setDismissed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  React.useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((value) => {
      setDismissed(value === "true");
      setLoaded(true);
    });
  }, []);

  const handleDismiss = async () => {
    setDismissed(true);
    await AsyncStorage.setItem(STORAGE_KEY, "true");
  };

  if (!loaded || dismissed) return null;

  return (
    <View style={[styles.container, { backgroundColor: theme.primary + "10", borderColor: theme.primary + "30" }]}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: theme.primary }]}>
          <Feather name="zap" size={14} color="#FFFFFF" />
        </View>
        <View style={styles.textContainer}>
          <ThemedText type="caption" style={{ fontWeight: "600" }}>
            We're a new marketplace
          </ThemedText>
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>
            Activity may be limited at first — but we're growing fast every day. Thanks for being an early member!
          </ThemedText>
        </View>
      </View>
      <View style={styles.actions}>
        {onLearnMore ? (
          <Pressable onPress={onLearnMore} style={styles.learnMoreButton}>
            <ThemedText type="caption" style={{ color: theme.primary, fontWeight: "600" }}>
              Learn more
            </ThemedText>
          </Pressable>
        ) : null}
        <Pressable onPress={handleDismiss} style={styles.dismissButton}>
          <Feather name="x" size={16} color={theme.textSecondary} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  content: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: Spacing.sm,
    gap: Spacing.md,
  },
  learnMoreButton: {
    paddingVertical: Spacing.xs,
  },
  dismissButton: {
    padding: Spacing.xs,
  },
});
