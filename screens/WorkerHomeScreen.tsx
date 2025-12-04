import React, { useState, useMemo } from "react";
import { View, StyleSheet, Pressable, Modal, ScrollView, TextInput } from "react-native";
import { Feather } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { TaskCard } from "@/components/TaskCard";
import { ScreenFlatList } from "@/components/ScreenFlatList";
import Spacer from "@/components/Spacer";
import { InfoBanner } from "@/components/InfoBanner";
import { EarlyAccessBanner } from "@/components/EarlyAccessBanner";
import { RegionNotice } from "@/components/RegionNotice";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/types";
import { useApp } from "@/context/AppContext";
import { Task, TaskCategoryId, CATEGORIES, CategoryInfo, getCategoryLabel, CATEGORY_MAP } from "@/types";

type WorkerHomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

type FilterOption = "All" | TaskCategoryId;

export default function WorkerHomeScreen({ navigation }: WorkerHomeScreenProps) {
  const { theme } = useTheme();
  const { tasks, canAcceptMoreJobs, getActiveJobsCount, getMaxActiveJobs } = useApp();
  
  const activeJobsCount = getActiveJobsCount();
  const maxActiveJobs = getMaxActiveJobs();
  const canTakeMoreJobs = canAcceptMoreJobs();
  
  const [showBanner, setShowBanner] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<FilterOption>("All");
  const [zipCodeFilter, setZipCodeFilter] = useState("");
  const [toolsRequiredFilter, setToolsRequiredFilter] = useState<boolean | null>(null);
  const [toolsProvidedFilter, setToolsProvidedFilter] = useState<boolean | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const availableTasks = useMemo(() => {
    return tasks.filter(task => {
      if (task.status !== "requested" && task.status !== "paid_waiting") return false;
      
      if (selectedCategory !== "All" && task.category !== selectedCategory) return false;
      
      if (zipCodeFilter && !task.zipCode.startsWith(zipCodeFilter)) return false;
      
      if (toolsRequiredFilter !== null && task.toolsRequired !== toolsRequiredFilter) return false;
      
      if (toolsProvidedFilter !== null && task.toolsProvided !== toolsProvidedFilter) return false;
      
      return true;
    });
  }, [tasks, selectedCategory, zipCodeFilter, toolsRequiredFilter, toolsProvidedFilter]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== "All") count++;
    if (zipCodeFilter) count++;
    if (toolsRequiredFilter !== null) count++;
    if (toolsProvidedFilter !== null) count++;
    return count;
  }, [selectedCategory, zipCodeFilter, toolsRequiredFilter, toolsProvidedFilter]);

  const clearFilters = () => {
    setSelectedCategory("All");
    setZipCodeFilter("");
    setToolsRequiredFilter(null);
    setToolsProvidedFilter(null);
  };

  const renderItem = ({ item }: { item: Task }) => (
    <>
      <TaskCard
        task={item}
        isCustomerView={false}
        onPress={() => navigation.navigate("TaskDetail", { task: item })}
      />
      <Spacer height={Spacing.md} />
    </>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIconContainer, { backgroundColor: theme.backgroundDefault }]}>
        <Feather name="search" size={48} color={theme.textSecondary} />
      </View>
      <ThemedText type="h3" style={styles.emptyTitle}>
        No jobs available
      </ThemedText>
      <ThemedText type="body" style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
        {activeFiltersCount > 0 
          ? "Try adjusting your filters to see more jobs"
          : "Check back soon for new jobs in your area"
        }
      </ThemedText>
      {activeFiltersCount > 0 ? (
        <Pressable
          onPress={clearFilters}
          style={[styles.clearButton, { backgroundColor: theme.primary }]}
        >
          <ThemedText type="body" style={{ color: "#FFFFFF" }}>Clear Filters</ThemedText>
        </Pressable>
      ) : null}
    </View>
  );

  const categoryOptions: FilterOption[] = ["All", ...CATEGORIES.map(c => c.id)];

  return (
    <>
      <ScreenFlatList
        data={availableTasks}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmpty}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            <EarlyAccessBanner onLearnMore={() => navigation.navigate("Help")} />
            
            <RegionNotice />
            
            {showBanner ? (
              <InfoBanner 
                variant="compact" 
                showDismiss 
                onDismiss={() => setShowBanner(false)}
                onLearnMore={() => navigation.navigate("Help")}
              />
            ) : null}

            <View style={[
              styles.jobStatusCard, 
              { 
                backgroundColor: canTakeMoreJobs ? theme.backgroundDefault : theme.error + "15",
                borderColor: canTakeMoreJobs ? theme.border : theme.error + "40",
              }
            ]}>
              <View style={styles.jobStatusRow}>
                <Feather 
                  name={canTakeMoreJobs ? "briefcase" : "alert-circle"} 
                  size={18} 
                  color={canTakeMoreJobs ? theme.primary : theme.error} 
                />
                <ThemedText type="body" style={{ marginLeft: Spacing.sm, flex: 1 }}>
                  Active Jobs: {activeJobsCount} / {maxActiveJobs}
                </ThemedText>
                {!canTakeMoreJobs ? (
                  <View style={[styles.limitBadge, { backgroundColor: theme.error }]}>
                    <ThemedText type="caption" style={{ color: "#FFFFFF", fontWeight: "600" }}>LIMIT</ThemedText>
                  </View>
                ) : null}
              </View>
              {!canTakeMoreJobs ? (
                <ThemedText type="caption" style={{ color: theme.error, marginTop: Spacing.xs }}>
                  Complete current jobs to accept more
                </ThemedText>
              ) : null}
            </View>
            
            <View style={styles.header}>
              <ThemedText type="h3">Available Jobs</ThemedText>
              <View style={[styles.countBadge, { backgroundColor: theme.funded }]}>
                <ThemedText type="caption" style={{ color: theme.fundedText, fontWeight: "600" }}>
                  {availableTasks.length} available
                </ThemedText>
              </View>
            </View>
            
            <Pressable
              onPress={() => setShowFilters(true)}
              style={[styles.filterButton, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
            >
              <Feather name="sliders" size={18} color={theme.text} />
              <ThemedText type="body" style={{ marginLeft: Spacing.sm }}>Filters</ThemedText>
              {activeFiltersCount > 0 ? (
                <View style={[styles.filterBadge, { backgroundColor: theme.primary }]}>
                  <ThemedText type="caption" style={{ color: "#FFFFFF", fontWeight: "600" }}>
                    {activeFiltersCount}
                  </ThemedText>
                </View>
              ) : null}
            </Pressable>

            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.categoryScroll}
              contentContainerStyle={styles.categoryScrollContent}
            >
              {categoryOptions.map((cat) => {
                const isEmergency = cat !== "All" && CATEGORY_MAP[cat]?.isEmergency;
                const displayLabel = cat === "All" ? "All" : getCategoryLabel(cat);
                return (
                  <Pressable
                    key={cat}
                    onPress={() => setSelectedCategory(cat)}
                    style={[
                      styles.categoryChip,
                      { 
                        backgroundColor: selectedCategory === cat 
                          ? (isEmergency ? theme.error : theme.primary) 
                          : theme.backgroundDefault,
                        borderColor: selectedCategory === cat 
                          ? (isEmergency ? theme.error : theme.primary) 
                          : (isEmergency ? theme.error + "40" : theme.border),
                      }
                    ]}
                  >
                    <ThemedText 
                      type="caption" 
                      style={{ 
                        color: selectedCategory === cat 
                          ? "#FFFFFF" 
                          : (isEmergency ? theme.error : theme.text),
                        fontWeight: selectedCategory === cat ? "600" : (isEmergency ? "600" : "400"),
                      }}
                    >
                      {displayLabel}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        }
      />

      <Modal
        visible={showFilters}
        animationType="slide"
        transparent
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText type="h4">Filter Jobs</ThemedText>
              <Pressable onPress={() => setShowFilters(false)}>
                <Feather name="x" size={24} color={theme.text} />
              </Pressable>
            </View>

            <ScrollView style={styles.filterList}>
              <View style={styles.filterSection}>
                <ThemedText type="small" style={styles.filterLabel}>Zip Code</ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.backgroundDefault, color: theme.text, borderColor: theme.border }]}
                  value={zipCodeFilter}
                  onChangeText={setZipCodeFilter}
                  placeholder="e.g., 10451"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="number-pad"
                  maxLength={5}
                />
              </View>

              <View style={styles.filterSection}>
                <ThemedText type="small" style={styles.filterLabel}>Tools Required</ThemedText>
                <View style={styles.buttonGroup}>
                  <Pressable
                    onPress={() => setToolsRequiredFilter(null)}
                    style={[
                      styles.segmentButton,
                      { 
                        backgroundColor: toolsRequiredFilter === null ? theme.primary : theme.backgroundDefault,
                        borderColor: toolsRequiredFilter === null ? theme.primary : theme.border,
                      }
                    ]}
                  >
                    <ThemedText type="caption" style={{ color: toolsRequiredFilter === null ? "#FFFFFF" : theme.text }}>
                      Any
                    </ThemedText>
                  </Pressable>
                  <Pressable
                    onPress={() => setToolsRequiredFilter(true)}
                    style={[
                      styles.segmentButton,
                      { 
                        backgroundColor: toolsRequiredFilter === true ? theme.primary : theme.backgroundDefault,
                        borderColor: toolsRequiredFilter === true ? theme.primary : theme.border,
                      }
                    ]}
                  >
                    <ThemedText type="caption" style={{ color: toolsRequiredFilter === true ? "#FFFFFF" : theme.text }}>
                      Yes
                    </ThemedText>
                  </Pressable>
                  <Pressable
                    onPress={() => setToolsRequiredFilter(false)}
                    style={[
                      styles.segmentButton,
                      { 
                        backgroundColor: toolsRequiredFilter === false ? theme.primary : theme.backgroundDefault,
                        borderColor: toolsRequiredFilter === false ? theme.primary : theme.border,
                      }
                    ]}
                  >
                    <ThemedText type="caption" style={{ color: toolsRequiredFilter === false ? "#FFFFFF" : theme.text }}>
                      No
                    </ThemedText>
                  </Pressable>
                </View>
              </View>

              <View style={styles.filterSection}>
                <ThemedText type="small" style={styles.filterLabel}>Tools Provided by Poster</ThemedText>
                <View style={styles.buttonGroup}>
                  <Pressable
                    onPress={() => setToolsProvidedFilter(null)}
                    style={[
                      styles.segmentButton,
                      { 
                        backgroundColor: toolsProvidedFilter === null ? theme.primary : theme.backgroundDefault,
                        borderColor: toolsProvidedFilter === null ? theme.primary : theme.border,
                      }
                    ]}
                  >
                    <ThemedText type="caption" style={{ color: toolsProvidedFilter === null ? "#FFFFFF" : theme.text }}>
                      Any
                    </ThemedText>
                  </Pressable>
                  <Pressable
                    onPress={() => setToolsProvidedFilter(true)}
                    style={[
                      styles.segmentButton,
                      { 
                        backgroundColor: toolsProvidedFilter === true ? theme.primary : theme.backgroundDefault,
                        borderColor: toolsProvidedFilter === true ? theme.primary : theme.border,
                      }
                    ]}
                  >
                    <ThemedText type="caption" style={{ color: toolsProvidedFilter === true ? "#FFFFFF" : theme.text }}>
                      Yes
                    </ThemedText>
                  </Pressable>
                  <Pressable
                    onPress={() => setToolsProvidedFilter(false)}
                    style={[
                      styles.segmentButton,
                      { 
                        backgroundColor: toolsProvidedFilter === false ? theme.primary : theme.backgroundDefault,
                        borderColor: toolsProvidedFilter === false ? theme.primary : theme.border,
                      }
                    ]}
                  >
                    <ThemedText type="caption" style={{ color: toolsProvidedFilter === false ? "#FFFFFF" : theme.text }}>
                      No
                    </ThemedText>
                  </Pressable>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <Pressable
                onPress={clearFilters}
                style={[styles.footerButton, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, borderWidth: 1 }]}
              >
                <ThemedText type="body">Clear All</ThemedText>
              </Pressable>
              <Pressable
                onPress={() => setShowFilters(false)}
                style={[styles.footerButton, { backgroundColor: theme.primary }]}
              >
                <ThemedText type="body" style={{ color: "#FFFFFF" }}>Apply Filters</ThemedText>
              </Pressable>
            </View>
          </ThemedView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    marginBottom: Spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  countBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 999,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  filterBadge: {
    marginLeft: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 999,
    minWidth: 20,
    alignItems: "center",
  },
  categoryScroll: {
    marginBottom: Spacing.sm,
  },
  categoryScrollContent: {
    gap: Spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 999,
    borderWidth: 1,
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
    marginBottom: Spacing.lg,
  },
  clearButton: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  filterList: {
    padding: Spacing.xl,
  },
  filterSection: {
    marginBottom: Spacing.xl,
  },
  filterLabel: {
    fontWeight: "600",
    marginBottom: Spacing.sm,
  },
  input: {
    height: 48,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
    borderWidth: 1,
  },
  buttonGroup: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    alignItems: "center",
  },
  modalFooter: {
    flexDirection: "row",
    gap: Spacing.md,
    padding: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  footerButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  jobStatusCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  jobStatusRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  limitBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
});
