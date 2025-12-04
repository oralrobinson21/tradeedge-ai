import React, { useState, useEffect } from "react";
import { View, StyleSheet, Pressable, Modal, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ThemedText } from "./ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

const HELPER_WAIVER_KEY = "citytasks_helper_waiver_accepted";

interface WaiverCheckboxProps {
  checked: boolean;
  onToggle: () => void;
  variant: "poster" | "helper";
}

export function WaiverCheckbox({ checked, onToggle, variant }: WaiverCheckboxProps) {
  const { theme } = useTheme();

  const waiverText = variant === "poster"
    ? "I understand that CityTasks connects posters with independent helpers. I agree to release CityTasks from any liability for damages, injuries, or issues arising from tasks performed. I will verify helper qualifications independently for specialized work."
    : "I understand that I am an independent contractor, not an employee of CityTasks. I agree to provide services safely and professionally. I release CityTasks from liability for any incidents during task performance.";

  return (
    <Pressable onPress={onToggle} style={styles.checkboxContainer}>
      <View style={[
        styles.checkbox, 
        { 
          borderColor: checked ? theme.primary : theme.border,
          backgroundColor: checked ? theme.primary : "transparent",
        }
      ]}>
        {checked ? <Feather name="check" size={14} color="#FFFFFF" /> : null}
      </View>
      <ThemedText type="small" style={{ flex: 1, color: theme.textSecondary }}>
        {waiverText}
      </ThemedText>
    </Pressable>
  );
}

interface HelperWaiverModalProps {
  visible: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export function HelperWaiverModal({ visible, onAccept, onDecline }: HelperWaiverModalProps) {
  const { theme } = useTheme();
  const [agreed, setAgreed] = useState(false);

  React.useEffect(() => {
    if (visible) {
      setAgreed(false);
    }
  }, [visible]);

  const handleAccept = () => {
    if (!agreed) return;
    onAccept();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onDecline}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.backgroundRoot }]}>
          <View style={styles.modalHeader}>
            <View style={[styles.iconContainer, { backgroundColor: theme.primary + "20" }]}>
              <Feather name="file-text" size={24} color={theme.primary} />
            </View>
            <ThemedText type="h3">Helper Agreement</ThemedText>
          </View>

          <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
            <ThemedText type="body" style={{ color: theme.textSecondary, marginBottom: Spacing.lg }}>
              Before you can send offers, please review and accept the following terms:
            </ThemedText>

            <View style={[styles.termSection, { backgroundColor: theme.backgroundDefault }]}>
              <ThemedText type="body" style={{ fontWeight: "600", marginBottom: Spacing.sm }}>
                Independent Contractor Status
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                You are an independent contractor, not an employee of CityTasks. You are responsible for your own taxes, insurance, and business expenses.
              </ThemedText>
            </View>

            <View style={[styles.termSection, { backgroundColor: theme.backgroundDefault }]}>
              <ThemedText type="body" style={{ fontWeight: "600", marginBottom: Spacing.sm }}>
                Safety & Professionalism
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                You agree to perform all tasks safely and professionally. You are responsible for having appropriate skills, tools, and if required, licenses or certifications for the work you accept.
              </ThemedText>
            </View>

            <View style={[styles.termSection, { backgroundColor: theme.backgroundDefault }]}>
              <ThemedText type="body" style={{ fontWeight: "600", marginBottom: Spacing.sm }}>
                Liability Release
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                You release CityTasks and its affiliates from any claims, damages, or injuries arising from tasks you perform. CityTasks is a platform connecting helpers with posters and is not liable for task outcomes.
              </ThemedText>
            </View>

            <View style={[styles.termSection, { backgroundColor: theme.backgroundDefault }]}>
              <ThemedText type="body" style={{ fontWeight: "600", marginBottom: Spacing.sm }}>
                Platform Rules
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                You agree to keep all payments on the CityTasks platform. Attempting to take payments off-platform may result in account suspension.
              </ThemedText>
            </View>

            <Pressable onPress={() => setAgreed(!agreed)} style={styles.agreeRow}>
              <View style={[
                styles.modalCheckbox, 
                { 
                  borderColor: agreed ? theme.primary : theme.border,
                  backgroundColor: agreed ? theme.primary : "transparent",
                }
              ]}>
                {agreed ? <Feather name="check" size={16} color="#FFFFFF" /> : null}
              </View>
              <ThemedText type="body" style={{ flex: 1 }}>
                I have read and agree to these terms
              </ThemedText>
            </Pressable>
          </ScrollView>

          <View style={styles.modalFooter}>
            <Pressable
              onPress={onDecline}
              style={[styles.declineButton, { borderColor: theme.border }]}
            >
              <ThemedText type="body" style={{ color: theme.textSecondary }}>
                Cancel
              </ThemedText>
            </Pressable>
            <Pressable
              onPress={handleAccept}
              disabled={!agreed}
              style={[
                styles.acceptButton, 
                { 
                  backgroundColor: theme.primary,
                  opacity: agreed ? 1 : 0.5,
                }
              ]}
            >
              <ThemedText type="body" style={{ color: "#FFFFFF", fontWeight: "600" }}>
                Accept & Continue
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export async function checkHelperWaiverAccepted(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(HELPER_WAIVER_KEY);
    return value === "accepted";
  } catch {
    return false;
  }
}

export async function setHelperWaiverAccepted(): Promise<void> {
  try {
    await AsyncStorage.setItem(HELPER_WAIVER_KEY, "accepted");
  } catch (error) {
    console.error("Failed to save waiver acceptance:", error);
  }
}

const styles = StyleSheet.create({
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
    paddingVertical: Spacing.md,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: BorderRadius.xs,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: "85%",
    paddingBottom: Spacing.xl,
  },
  modalHeader: {
    alignItems: "center",
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  modalScroll: {
    paddingHorizontal: Spacing.xl,
  },
  termSection: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  agreeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.lg,
  },
  modalCheckbox: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.xs,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  modalFooter: {
    flexDirection: "row",
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  declineButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: "center",
  },
  acceptButton: {
    flex: 2,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
});
