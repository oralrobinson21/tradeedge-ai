import React from "react";
import { View, StyleSheet, Modal, Pressable, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { useApp } from "@/context/AppContext";
import { Spacing, BorderRadius } from "@/constants/theme";

interface HelperWaiverModalProps {
  visible: boolean;
  onAccept: () => void;
}

export function HelperWaiverModal({ visible, onAccept }: HelperWaiverModalProps) {
  const { theme } = useTheme();
  const { acceptHelperWaiver } = useApp();

  const handleAccept = async () => {
    await acceptHelperWaiver();
    onAccept();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <ThemedView style={styles.modal}>
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: theme.primary + "20" }]}>
              <Feather name="briefcase" size={28} color={theme.primary} />
            </View>
            <ThemedText type="h3" style={{ textAlign: "center", marginTop: Spacing.md }}>
              Independent Contractor Agreement
            </ThemedText>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <ThemedText type="body" style={{ marginBottom: Spacing.md }}>
              Before accepting jobs on CityTasks, please understand and agree to the following:
            </ThemedText>

            <View style={styles.bulletPoint}>
              <Feather name="check-circle" size={18} color={theme.success} />
              <ThemedText type="body" style={{ flex: 1 }}>
                You are an independent contractor, not an employee of CityTasks.
              </ThemedText>
            </View>

            <View style={styles.bulletPoint}>
              <Feather name="check-circle" size={18} color={theme.success} />
              <ThemedText type="body" style={{ flex: 1 }}>
                You are responsible for your own work quality, safety, and compliance with all applicable local laws.
              </ThemedText>
            </View>

            <View style={styles.bulletPoint}>
              <Feather name="check-circle" size={18} color={theme.success} />
              <ThemedText type="body" style={{ flex: 1 }}>
                CityTasks only connects people and is not liable for damages, injuries, or losses resulting from any task.
              </ThemedText>
            </View>

            <View style={styles.bulletPoint}>
              <Feather name="check-circle" size={18} color={theme.success} />
              <ThemedText type="body" style={{ flex: 1 }}>
                You must carry your own insurance if required by the type of work you perform.
              </ThemedText>
            </View>

            <View style={[styles.warningBox, { backgroundColor: theme.error + "10", borderColor: theme.error + "30" }]}>
              <Feather name="alert-triangle" size={16} color={theme.error} />
              <ThemedText type="small" style={{ flex: 1, color: theme.textSecondary }}>
                Never accept payment outside of CityTasks. Off-platform payments violate our terms and remove your protection.
              </ThemedText>
            </View>
          </ScrollView>

          <Pressable
            style={[styles.acceptButton, { backgroundColor: theme.primary }]}
            onPress={handleAccept}
          >
            <ThemedText type="body" style={{ color: "#FFFFFF", fontWeight: "600" }}>
              I Agree
            </ThemedText>
          </Pressable>
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  modal: {
    width: "100%",
    maxHeight: "80%",
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    marginBottom: Spacing.lg,
  },
  bulletPoint: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  acceptButton: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
  },
});
