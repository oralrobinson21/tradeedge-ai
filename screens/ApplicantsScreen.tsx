import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, FlatList, Pressable, Alert, Image } from "react-native";
import { Feather } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/types";
import { useApp } from "@/context/AppContext";
import { JobOffer, PLATFORM_FEE_PERCENT } from "@/types";

type ApplicantsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Applicants">;
  route: RouteProp<RootStackParamList, "Applicants">;
};

const AVATAR_COLORS = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD",
];

export default function ApplicantsScreen({ navigation, route }: ApplicantsScreenProps) {
  const { task } = route.params;
  const { theme } = useTheme();
  const { user, jobOffers, chooseHelper, apiUrl } = useApp();
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(false);
  const [offers, setOffers] = useState<JobOffer[]>([]);

  useEffect(() => {
    fetchOffers();
  }, [task.id]);

  const fetchOffers = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/tasks/${task.id}/offers`, {
        headers: {
          "x-user-id": user?.id || "",
        },
      });
      if (response.ok) {
        const data = await response.json();
        setOffers(data.map((o: any) => ({
          id: o.id,
          taskId: o.task_id,
          helperId: o.helper_id,
          helperName: o.helper_name,
          helperPhotoUrl: o.helper_photo_url,
          note: o.note,
          proposedPrice: o.proposed_price ? parseFloat(o.proposed_price) : undefined,
          status: o.status,
          createdAt: o.created_at,
        })));
      }
    } catch (err) {
      console.error("Failed to fetch offers:", err);
    }
  };

  const handleHireHelper = async (offer: JobOffer) => {
    Alert.alert(
      "Hire Helper",
      `Are you sure you want to hire ${offer.helperName} for this job? You will be redirected to complete payment.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Hire & Pay",
          onPress: async () => {
            setIsLoading(true);
            try {
              const result = await chooseHelper(task.id, offer.id);
              if (result.checkoutUrl) {
                Alert.alert(
                  "Payment Required",
                  "Please complete payment in your browser to confirm the hire.",
                  [{ text: "OK", onPress: () => navigation.goBack() }]
                );
              } else {
                Alert.alert("Success", `${offer.helperName} has been hired!`, [
                  { text: "OK", onPress: () => navigation.goBack() }
                ]);
              }
            } catch (err: any) {
              Alert.alert("Error", err.message || "Failed to hire helper");
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const renderOffer = ({ item, index }: { item: JobOffer; index: number }) => {
    const avatarColor = AVATAR_COLORS[index % AVATAR_COLORS.length];
    const helperEarnings = task.price * (1 - PLATFORM_FEE_PERCENT);

    return (
      <View style={[styles.offerCard, { backgroundColor: theme.backgroundDefault }]}>
        <View style={styles.offerHeader}>
          {(item as any).helperPhotoUrl ? (
            <Image 
              source={{ uri: (item as any).helperPhotoUrl }} 
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
              <ThemedText type="h4" style={styles.avatarText}>
                {item.helperName.charAt(0).toUpperCase()}
              </ThemedText>
            </View>
          )}
          <View style={styles.helperInfo}>
            <ThemedText type="h4">{item.helperName}</ThemedText>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              Applied {getTimeAgo(item.createdAt)}
            </ThemedText>
          </View>
        </View>

        {item.note ? (
          <View style={[styles.noteSection, { backgroundColor: theme.backgroundSecondary }]}>
            <Feather name="message-circle" size={14} color={theme.textSecondary} />
            <ThemedText type="body" style={{ flex: 1, color: theme.text }}>
              "{item.note}"
            </ThemedText>
          </View>
        ) : null}

        {item.proposedPrice && item.proposedPrice !== task.price ? (
          <View style={[styles.priceNote, { backgroundColor: theme.secondary + "15" }]}>
            <Feather name="dollar-sign" size={14} color={theme.secondary} />
            <ThemedText type="small" style={{ color: theme.secondary }}>
              Proposed: ${item.proposedPrice.toFixed(2)} (vs. your ${task.price.toFixed(2)})
            </ThemedText>
          </View>
        ) : null}

        <Pressable
          onPress={() => handleHireHelper(item)}
          disabled={isLoading}
          style={({ pressed }) => [
            styles.hireButton,
            { 
              backgroundColor: theme.primary,
              opacity: pressed || isLoading ? 0.8 : 1,
            },
          ]}
        >
          <Feather name="check-circle" size={18} color="#FFFFFF" />
          <ThemedText type="body" style={styles.hireButtonText}>
            Hire {item.helperName.split(" ")[0]}
          </ThemedText>
        </Pressable>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIconContainer, { backgroundColor: theme.backgroundDefault }]}>
        <Feather name="users" size={48} color={theme.textSecondary} />
      </View>
      <ThemedText type="h3" style={styles.emptyTitle}>
        No applicants yet
      </ThemedText>
      <ThemedText type="body" style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
        Helpers who are interested in your task will appear here
      </ThemedText>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <Pressable 
          onPress={() => navigation.goBack()} 
          style={[styles.backButton, { backgroundColor: theme.backgroundDefault }]}
        >
          <Feather name="arrow-left" size={20} color={theme.text} />
        </Pressable>
        <View style={styles.headerContent}>
          <ThemedText type="h3">Applicants</ThemedText>
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>
            {task.title}
          </ThemedText>
        </View>
      </View>

      <View style={[styles.taskSummary, { backgroundColor: theme.backgroundDefault }]}>
        <View style={styles.taskRow}>
          <ThemedText type="body" style={{ color: theme.textSecondary }}>
            Job Price:
          </ThemedText>
          <ThemedText type="h4" style={{ color: theme.primary }}>
            ${task.price.toFixed(2)}
          </ThemedText>
        </View>
        <View style={styles.taskRow}>
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>
            Helper receives ({(1 - PLATFORM_FEE_PERCENT) * 100}%):
          </ThemedText>
          <ThemedText type="body" style={{ color: theme.success }}>
            ${(task.price * (1 - PLATFORM_FEE_PERCENT)).toFixed(2)}
          </ThemedText>
        </View>
      </View>

      <FlatList
        data={offers}
        renderItem={renderOffer}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
    gap: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerContent: {
    flex: 1,
  },
  taskSummary: {
    marginHorizontal: Spacing.xl,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  taskRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.xs,
  },
  listContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  offerCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  offerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  helperInfo: {
    flex: 1,
  },
  noteSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  priceNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
  },
  hireButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  hireButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: Spacing["3xl"],
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
  },
  emptyTitle: {
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  emptySubtitle: {
    textAlign: "center",
    paddingHorizontal: Spacing.xl,
  },
});
