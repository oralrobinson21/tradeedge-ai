import React, { useMemo } from "react";
import { View, StyleSheet, SectionList, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { TaskCard } from "@/components/TaskCard";
import Spacer from "@/components/Spacer";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/types";
import { useApp } from "@/context/AppContext";
import { Task, JobOffer, PLATFORM_FEE_PERCENT } from "@/types";

type ActivityScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

interface Section {
  title: string;
  data: Task[];
}

interface TaskWithOffers extends Task {
  offers?: JobOffer[];
  offerCount?: number;
}

export default function ActivityScreen({ navigation }: ActivityScreenProps) {
  const { theme } = useTheme();
  const { user, tasks, userMode, jobOffers } = useApp();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();

  const isHelper = userMode === "helper";

  const { relevantTasks, appliedTaskIds } = useMemo(() => {
    const userOffers = jobOffers.filter(o => o.helperId === user?.id);
    const appliedIds = new Set(userOffers.map(o => o.taskId));
    
    if (isHelper) {
      const helperTasks = tasks.filter(task => 
        task.helperId === user?.id || appliedIds.has(task.id)
      );
      return { relevantTasks: helperTasks, appliedTaskIds: appliedIds };
    } else {
      const posterTasks = tasks.filter(task => task.posterId === user?.id);
      return { relevantTasks: posterTasks, appliedTaskIds: appliedIds };
    }
  }, [tasks, jobOffers, user?.id, isHelper]);

  const tasksWithOfferCounts = useMemo(() => {
    if (isHelper) return relevantTasks;
    
    return relevantTasks.map(task => {
      const taskOffers = jobOffers.filter(o => o.taskId === task.id);
      return {
        ...task,
        offers: taskOffers,
        offerCount: taskOffers.length,
      } as TaskWithOffers;
    });
  }, [relevantTasks, jobOffers, isHelper]);

  const sections = useMemo(() => {
    const sectionList: Section[] = [];
    
    if (isHelper) {
      const appliedTasks = tasksWithOfferCounts.filter(
        task => task.status === "requested" && appliedTaskIds.has(task.id) && task.helperId !== user?.id
      );
      const inProgressTasks = tasksWithOfferCounts.filter(
        task => ["assigned", "in_progress", "worker_marked_done", "paid_waiting"].includes(task.status) && task.helperId === user?.id
      );
      const completedTasks = tasksWithOfferCounts.filter(
        task => task.status === "completed" && task.helperId === user?.id
      );
      const disputedTasks = tasksWithOfferCounts.filter(
        task => task.status === "disputed" && task.helperId === user?.id
      );

      if (appliedTasks.length > 0) sectionList.push({ title: "Applied", data: appliedTasks });
      if (inProgressTasks.length > 0) sectionList.push({ title: "In Progress", data: inProgressTasks });
      if (completedTasks.length > 0) sectionList.push({ title: "Completed", data: completedTasks });
      if (disputedTasks.length > 0) sectionList.push({ title: "Disputed", data: disputedTasks });
    } else {
      const openTasks = tasksWithOfferCounts.filter(
        task => task.status === "requested"
      );
      const inProgressTasks = tasksWithOfferCounts.filter(
        task => ["assigned", "in_progress", "worker_marked_done", "paid_waiting"].includes(task.status)
      );
      const completedTasks = tasksWithOfferCounts.filter(
        task => task.status === "completed"
      );
      const disputedTasks = tasksWithOfferCounts.filter(
        task => task.status === "disputed"
      );

      if (openTasks.length > 0) sectionList.push({ title: "Open", data: openTasks });
      if (inProgressTasks.length > 0) sectionList.push({ title: "In Progress", data: inProgressTasks });
      if (completedTasks.length > 0) sectionList.push({ title: "Completed", data: completedTasks });
      if (disputedTasks.length > 0) sectionList.push({ title: "Disputed", data: disputedTasks });
    }
    
    return sectionList;
  }, [tasksWithOfferCounts, isHelper, appliedTaskIds, user?.id]);

  const totalEarnings = useMemo(() => {
    if (!isHelper) return 0;
    const completed = tasksWithOfferCounts.filter(
      task => task.status === "completed" && task.helperId === user?.id
    );
    return completed.reduce((sum, task) => sum + task.price * (1 - PLATFORM_FEE_PERCENT), 0);
  }, [tasksWithOfferCounts, isHelper, user?.id]);

  const renderItem = ({ item }: { item: TaskWithOffers }) => {
    const isPoster = !isHelper;
    const hasOffers = isPoster && item.offerCount && item.offerCount > 0;
    const isOpen = item.status === "requested";

    return (
      <View>
        <TaskCard
          task={item}
          isCustomerView={isPoster}
          onPress={() => navigation.navigate("TaskDetail", { task: item })}
        />
        
        {isPoster && isOpen && hasOffers ? (
          <Pressable
            onPress={() => navigation.navigate("Applicants", { task: item })}
            style={({ pressed }) => [
              styles.applicantsButton,
              { 
                backgroundColor: theme.primary + "15",
                borderColor: theme.primary,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Feather name="users" size={16} color={theme.primary} />
            <ThemedText type="body" style={{ color: theme.primary, fontWeight: "600" }}>
              View {item.offerCount} Applicant{item.offerCount !== 1 ? "s" : ""}
            </ThemedText>
            <Feather name="chevron-right" size={18} color={theme.primary} />
          </Pressable>
        ) : null}
        
        {isPoster && isOpen && !hasOffers ? (
          <View style={[styles.noApplicantsIndicator, { backgroundColor: theme.backgroundSecondary }]}>
            <Feather name="clock" size={14} color={theme.textSecondary} />
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              Waiting for helpers to apply
            </ThemedText>
          </View>
        ) : null}

        {isHelper && appliedTaskIds.has(item.id) && item.status === "requested" ? (
          <View style={[styles.appliedIndicator, { backgroundColor: theme.success + "15" }]}>
            <Feather name="check-circle" size={14} color={theme.success} />
            <ThemedText type="caption" style={{ color: theme.success, fontWeight: "600" }}>
              You applied for this job
            </ThemedText>
          </View>
        ) : null}
        
        <Spacer height={Spacing.md} />
      </View>
    );
  };

  const renderSectionHeader = ({ section }: { section: Section }) => (
    <View style={[styles.sectionHeader, { backgroundColor: theme.backgroundRoot }]}>
      <ThemedText type="h4">{section.title}</ThemedText>
      <ThemedText type="caption" style={{ color: theme.textSecondary }}>
        {section.data.length} task{section.data.length !== 1 ? "s" : ""}
      </ThemedText>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIconContainer, { backgroundColor: theme.backgroundDefault }]}>
        <Feather name="activity" size={48} color={theme.textSecondary} />
      </View>
      <ThemedText type="h3" style={styles.emptyTitle}>
        No activity yet
      </ThemedText>
      <ThemedText type="body" style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
        {isHelper
          ? "Jobs you apply for will appear here"
          : "Tasks you post will appear here"}
      </ThemedText>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      {isHelper && totalEarnings > 0 ? (
        <View style={[styles.earningsCard, { backgroundColor: theme.primary, marginTop: headerHeight + Spacing.xl }]}>
          <View>
            <ThemedText type="small" style={styles.earningsLabel}>
              Total Earnings
            </ThemedText>
            <ThemedText type="h1" style={styles.earningsAmount}>
              ${totalEarnings.toFixed(2)}
            </ThemedText>
          </View>
          <View style={styles.earningsIcon}>
            <Feather name="trending-up" size={32} color="rgba(255,255,255,0.8)" />
          </View>
        </View>
      ) : null}
      
      <SectionList
        sections={sections}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.listContent,
          { 
            paddingTop: isHelper && totalEarnings > 0 ? Spacing.lg : headerHeight + Spacing.xl,
            paddingBottom: tabBarHeight + Spacing.xl,
          },
        ]}
        stickySectionHeadersEnabled={false}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.xl,
  },
  earningsCard: {
    marginHorizontal: Spacing.xl,
    padding: Spacing.xl,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  earningsLabel: {
    color: "rgba(255,255,255,0.8)",
    marginBottom: 4,
  },
  earningsAmount: {
    color: "#FFFFFF",
  },
  earningsIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.md,
    marginBottom: Spacing.sm,
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
  applicantsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginTop: Spacing.sm,
  },
  noApplicantsIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
  },
  appliedIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
  },
});
