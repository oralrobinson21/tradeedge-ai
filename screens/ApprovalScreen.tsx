import React, { useState } from "react";
import { View, StyleSheet, Pressable, Alert, ActivityIndicator, Image } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/types";
import { useApp } from "@/context/AppContext";

type ApprovalScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Approval">;
  route: RouteProp<RootStackParamList, "Approval">;
};

export default function ApprovalScreen({ navigation, route }: ApprovalScreenProps) {
  const { task } = route.params;
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { approveJob, disputeJob } = useApp();

  const [isProcessing, setIsProcessing] = useState(false);

  const handleApprove = async () => {
    Alert.alert("Approve Work?", "Mark this job as complete and approve the worker?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Approve",
        onPress: async () => {
          setIsProcessing(true);
          try {
            await approveJob(task.id);
            Alert.alert("Success", "Job approved! Proceeding to rating.");
            navigation.replace("Rating", { task });
          } catch (error) {
            Alert.alert("Error", "Failed to approve job");
          } finally {
            setIsProcessing(false);
          }
        },
      },
    ]);
  };

  const handleDispute = async () => {
    Alert.alert("Report Problem", "Are you sure there's a problem with this work?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Report Problem",
        style: "destructive",
        onPress: async () => {
          setIsProcessing(true);
          try {
            await disputeJob(task.id);
            Alert.alert("Problem Reported", "The dispute has been marked. You can message the worker to resolve.", [
              {
                text: "OK",
                onPress: () => navigation.reset({
                  index: 0,
                  routes: [{ name: "Main" }],
                }),
              },
            ]);
          } catch (error) {
            Alert.alert("Error", "Failed to report problem");
          } finally {
            setIsProcessing(false);
          }
        },
      },
    ]);
  };

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [styles.headerButton, { opacity: pressed ? 0.7 : 1 }]}
        >
          <Feather name="arrow-left" size={24} color={theme.text} />
        </Pressable>
        <ThemedText type="h4">Review Work</ThemedText>
        <View style={styles.headerButton} />
      </View>

      <ScreenScrollView contentContainerStyle={styles.content}>
        <View style={[styles.card, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="h3" style={styles.taskTitle}>{task.title}</ThemedText>
          <ThemedText type="body" style={[styles.description, { color: theme.textSecondary }]}>
            {task.description}
          </ThemedText>
        </View>

        {task.beforePhotoUrl && (
          <View style={styles.photoSection}>
            <ThemedText type="h4" style={styles.sectionTitle}>Before</ThemedText>
            <Image source={{ uri: task.beforePhotoUrl }} style={styles.photo} />
          </View>
        )}

        {task.afterPhotoUrl && (
          <View style={styles.photoSection}>
            <ThemedText type="h4" style={styles.sectionTitle}>After</ThemedText>
            <Image source={{ uri: task.afterPhotoUrl }} style={styles.photo} />
          </View>
        )}

        <View style={[styles.infoBox, { backgroundColor: theme.backgroundDefault }]}>
          <Feather name="info" size={16} color={theme.primary} />
          <ThemedText type="caption" style={{ flex: 1, color: theme.textSecondary }}>
            Review the photos and decide if the work meets your expectations. You can message the worker if you have questions.
          </ThemedText>
        </View>
      </ScreenScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.md }]}>
        <Pressable
          onPress={handleDispute}
          disabled={isProcessing}
          style={({ pressed }) => [
            styles.button,
            styles.problemButton,
            { opacity: pressed ? 0.7 : 1 },
          ]}
        >
          {isProcessing ? (
            <ActivityIndicator color={theme.primary} />
          ) : (
            <>
              <Feather name="alert-circle" size={20} color={theme.primary} />
              <ThemedText type="body" style={{ color: theme.primary, fontWeight: "600" }}>
                Report Problem
              </ThemedText>
            </>
          )}
        </Pressable>

        <Pressable
          onPress={handleApprove}
          disabled={isProcessing}
          style={({ pressed }) => [
            styles.button,
            styles.approveButton,
            { backgroundColor: theme.primary, opacity: pressed ? 0.9 : 1 },
          ]}
        >
          {isProcessing ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Feather name="check-circle" size={20} color="#FFFFFF" />
              <ThemedText type="body" style={{ color: "#FFFFFF", fontWeight: "600" }}>
                Approve Work
              </ThemedText>
            </>
          )}
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerButton: {
    width: 40,
    height: 40,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing["2xl"],
  },
  card: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl,
  },
  taskTitle: {
    marginBottom: Spacing.sm,
  },
  description: {
    lineHeight: 20,
  },
  photoSection: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  photo: {
    width: "100%",
    height: 300,
    borderRadius: BorderRadius.md,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    gap: Spacing.sm,
  },
  problemButton: {
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
  },
  approveButton: {},
});
