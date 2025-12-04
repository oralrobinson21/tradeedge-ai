import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { Task } from "@/types";

interface PriceAdjustmentBannerProps {
  task: Task;
  onAdjustPrice: () => void;
  onDismiss: () => void;
}

export function PriceAdjustmentBanner({
  task,
  onAdjustPrice,
  onDismiss,
}: PriceAdjustmentBannerProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.link + "15" }]}>
      <Pressable style={styles.closeButton} onPress={onDismiss}>
        <Feather name="x" size={18} color={theme.textSecondary} />
      </Pressable>
      
      <View style={styles.content}>
        <View style={[styles.iconCircle, { backgroundColor: theme.link + "30" }]}>
          <Feather name="trending-up" size={20} color={theme.link} />
        </View>
        
        <View style={styles.textContent}>
          <ThemedText type="body" style={{ fontWeight: "600", marginBottom: 2 }}>
            No helpers yet
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }} numberOfLines={2}>
            "{task.title}" - Consider adjusting your price to attract helpers
          </ThemedText>
        </View>
      </View>
      
      <Pressable
        style={[styles.actionButton, { backgroundColor: theme.link }]}
        onPress={onAdjustPrice}
      >
        <ThemedText type="small" style={{ color: theme.buttonText, fontWeight: "600" }}>
          Adjust Price
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: Spacing.sm,
    right: Spacing.sm,
    padding: Spacing.xs,
    zIndex: 1,
  },
  content: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.md,
    paddingRight: Spacing.xl,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  textContent: {
    flex: 1,
  },
  actionButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.full,
    alignSelf: "flex-start",
  },
});
