import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, Pressable, Alert, TextInput, Modal, Image, ScrollView, Dimensions, Linking } from "react-native";
import { Feather } from "@expo/vector-icons";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import * as WebBrowser from "expo-web-browser";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { StatusBadge } from "@/components/StatusBadge";
import { SafetyBanner } from "@/components/SafetyBanner";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { HelperWaiverModal, checkHelperWaiverAccepted, setHelperWaiverAccepted } from "@/components/LiabilityWaiver";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/types";
import { useApp } from "@/context/AppContext";
import { Task, PLATFORM_FEE_PERCENT, ExtraWorkRequest, PHONE_VERIFICATION_THRESHOLD } from "@/types";

type TaskDetailScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "TaskDetail">;
  route: RouteProp<RootStackParamList, "TaskDetail">;
};

const AVATAR_COLORS = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD"];
const TIP_AMOUNTS = [5, 10, 20];

export default function TaskDetailScreen({ navigation, route }: TaskDetailScreenProps) {
  const { task: initialTask } = route.params;
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { user, userMode, tasks, chatThreads, completeTask, sendOffer, hasProfilePhoto, apiUrl, canAcceptMoreJobs, getActiveJobsCount, getMaxActiveJobs } = useApp();

  const [extraWorkRequests, setExtraWorkRequests] = useState<ExtraWorkRequest[]>([]);
  const [showExtraWorkModal, setShowExtraWorkModal] = useState(false);
  const [extraAmount, setExtraAmount] = useState("");
  const [extraReason, setExtraReason] = useState("");
  const [showTipModal, setShowTipModal] = useState(false);
  const [tipAmount, setTipAmount] = useState("");
  const [customTip, setCustomTip] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [showHelperWaiverModal, setShowHelperWaiverModal] = useState(false);
  const photoViewerRef = useRef<ScrollView>(null);

  const allTasks = tasks ?? [];
  const allThreads = chatThreads ?? [];
  
  const contextTask = allTasks.find(t => t.id === initialTask.id);
  const task = currentTask || contextTask || initialTask;
  const isPoster = task.posterId === user?.id;
  const isHelper = task.helperId === user?.id;
  const isMyTask = isPoster || isHelper;

  useEffect(() => {
    const isEligibleStatus = ["accepted", "assigned", "in_progress", "completed", "worker_marked_done"].includes(task.status);
    if (task.id && isEligibleStatus) {
      fetchExtraWorkRequests();
    }
  }, [task.id, task.status]);

  const refreshTaskData = async () => {
    const updatedTask = await fetchTaskData();
    if (updatedTask) {
      setCurrentTask(updatedTask as Task);
    }
    await fetchExtraWorkRequests();
  };

  const fetchExtraWorkRequests = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/tasks/${task.id}/extra-work`, {
        headers: {
          "x-user-id": user?.id || "",
        },
      });
      if (response.ok) {
        const data = await response.json();
        setExtraWorkRequests(data.map((r: any) => ({
          id: r.id,
          taskId: r.task_id,
          helperId: r.helper_id,
          amount: parseFloat(r.amount),
          reason: r.reason,
          photoUrls: r.photo_urls || [],
          status: r.status,
          stripeCheckoutSessionId: r.stripe_checkout_session_id,
          stripePaymentIntentId: r.stripe_payment_intent_id,
          createdAt: r.created_at,
          respondedAt: r.responded_at,
          paidAt: r.paid_at,
        })));
      }
    } catch (err) {
      console.error("Failed to fetch extra work requests:", err);
    }
  };

  const fetchTaskData = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/tasks/${task.id}`, {
        headers: {
          "x-user-id": user?.id || "",
        },
      });
      if (response.ok) {
        const data = await response.json();
        return {
          ...data,
          id: data.id,
          title: data.title,
          description: data.description,
          category: data.category,
          zipCode: data.zip_code,
          areaDescription: data.area_description,
          fullAddress: data.full_address,
          price: parseFloat(data.price),
          status: data.status,
          posterId: data.poster_id,
          posterName: data.poster_name,
          posterEmail: data.poster_email,
          posterPhotoUrl: data.poster_photo_url,
          helperId: data.helper_id,
          helperName: data.helper_name,
          confirmationCode: data.confirmation_code,
          photosRequired: data.photos_required,
          toolsRequired: data.tools_required,
          toolsProvided: data.tools_provided,
          photos: data.photos || [],
          taskPhotoUrl: data.task_photo_url,
          tipAmount: data.tip_amount ? parseFloat(data.tip_amount) : undefined,
          extraAmountPaid: data.extra_amount_paid ? parseFloat(data.extra_amount_paid) : 0,
          createdAt: data.created_at,
        };
      }
    } catch (err) {
      console.error("Failed to fetch task:", err);
    }
    return null;
  };

  const handleSendOffer = async () => {
    const hasPhoto = await hasProfilePhoto();
    if (!hasPhoto) {
      Alert.alert(
        "Profile Photo Required",
        "Please add a profile photo before sending offers. This helps build trust with posters.",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Add Photo", 
            onPress: () => navigation.navigate("MainTabs", { screen: "Profile" } as any) 
          },
        ]
      );
      return;
    }

    if (task.price >= PHONE_VERIFICATION_THRESHOLD && !user?.isPhoneVerified) {
      Alert.alert(
        "Phone Verification Required",
        `Sending offers on tasks priced at $${PHONE_VERIFICATION_THRESHOLD} or more requires a verified phone number for your safety.`,
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Verify Phone", 
            onPress: () => navigation.navigate("MainTabs", { screen: "Profile" } as any)
          },
        ]
      );
      return;
    }

    if (!canAcceptMoreJobs()) {
      const activeCount = getActiveJobsCount();
      const maxJobs = getMaxActiveJobs();
      Alert.alert(
        "Job Limit Reached",
        `You currently have ${activeCount} active job${activeCount !== 1 ? "s" : ""} (max ${maxJobs}). Complete some of your current jobs before accepting new ones.`,
        [{ text: "OK" }]
      );
      return;
    }

    const waiverAccepted = await checkHelperWaiverAccepted();
    if (!waiverAccepted) {
      setShowHelperWaiverModal(true);
      return;
    }
    
    proceedWithSendOffer();
  };

  const proceedWithSendOffer = () => {
    Alert.alert(
      "Send an Offer",
      `Would you like to offer your help for "${task.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send Offer",
          onPress: async () => {
            try {
              await sendOffer(task.id, "I'd like to help with this task!");
              Alert.alert("Offer Sent", "The poster will review your offer.");
            } catch (err) {
              Alert.alert("Error", "Failed to send offer. Please try again.");
            }
          },
        },
      ]
    );
  };

  const handleHelperWaiverAccept = async () => {
    await setHelperWaiverAccepted();
    setShowHelperWaiverModal(false);
    proceedWithSendOffer();
  };

  const handleHelperWaiverDecline = () => {
    setShowHelperWaiverModal(false);
  };

  const handleMarkJobDone = () => {
    navigation.navigate("CompletionPhoto", { task });
  };

  const handleApproveWork = () => {
    navigation.navigate("Approval", { task });
  };

  const handleMessage = () => {
    const thread = allThreads.find(t => t.taskId === task.id);
    if (!thread) {
      Alert.alert("No Chat Available", "A chat thread will be created once a helper is chosen and payment is complete.");
      return;
    }
    const otherUserName = isPoster ? (task.helperName || "Helper") : (task.posterName || "Poster");
    navigation.navigate("Chat", { threadId: thread.id, taskId: task.id, otherUserName });
  };

  const handleGoToPayment = () => {
    navigation.navigate("Payment", { task });
  };

  const handleRequestExtraWork = async () => {
    const amount = parseFloat(extraAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid amount.");
      return;
    }
    if (!extraReason.trim()) {
      Alert.alert("Reason Required", "Please explain why extra work is needed.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/tasks/${task.id}/extra-work`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user?.id || "",
        },
        body: JSON.stringify({
          amount,
          reason: extraReason.trim(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to submit request");
      }

      Alert.alert("Request Sent", "The poster will review your extra work request.");
      setShowExtraWorkModal(false);
      setExtraAmount("");
      setExtraReason("");
      fetchExtraWorkRequests();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to submit extra work request.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptExtraWork = async (requestId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/extra-work/${requestId}/accept`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user?.id || "",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to accept request");
      }

      const data = await response.json();
      if (data.checkoutUrl) {
        await WebBrowser.openBrowserAsync(data.checkoutUrl);
        await refreshTaskData();
      }
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to accept extra work request.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeclineExtraWork = async (requestId: string) => {
    Alert.alert(
      "Decline Request",
      "Are you sure you want to decline this extra work request? The helper can still complete the job at the original price.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Decline",
          style: "destructive",
          onPress: async () => {
            setIsLoading(true);
            try {
              const response = await fetch(`${apiUrl}/api/extra-work/${requestId}/decline`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "x-user-id": user?.id || "",
                },
              });

              if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to decline request");
              }

              fetchExtraWorkRequests();
            } catch (err: any) {
              Alert.alert("Error", err.message || "Failed to decline request.");
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleSendTip = async () => {
    const amount = tipAmount === "custom" ? parseFloat(customTip) : parseFloat(tipAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid tip amount.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/tasks/${task.id}/tip`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user?.id || "",
        },
        body: JSON.stringify({ amount }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create tip");
      }

      const data = await response.json();
      if (data.checkoutUrl) {
        await WebBrowser.openBrowserAsync(data.checkoutUrl);
        await refreshTaskData();
      }
      setShowTipModal(false);
      setTipAmount("");
      setCustomTip("");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to send tip.");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBannerStyle = () => {
    switch (task.status) {
      case "paid_waiting":
        return { backgroundColor: theme.funded, borderColor: theme.fundedText };
      case "assigned":
        return { backgroundColor: theme.assigned, borderColor: theme.assignedText };
      case "completed":
        return { backgroundColor: theme.completed, borderColor: theme.completedText };
      default:
        return { backgroundColor: theme.backgroundDefault, borderColor: theme.textSecondary };
    }
  };

  const getStatusText = () => {
    switch (task.status) {
      case "unpaid":
        return "Payment Required";
      case "paid_waiting":
        return "Funded - Waiting for helper";
      case "assigned":
        return "Helper assigned";
      case "worker_marked_done":
        return "Waiting for approval";
      case "completed":
        return "Completed";
      case "disputed":
        return "Disputed";
      default:
        return task.status;
    }
  };

  const helperEarnings = task.price * (1 - PLATFORM_FEE_PERCENT);
  const pendingExtraRequests = extraWorkRequests.filter(r => r.status === "pending");
  const totalExtraPaid = task.extraAmountPaid || 0;

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [styles.headerButton, { opacity: pressed ? 0.7 : 1 }]}
        >
          <Feather name="arrow-left" size={24} color={theme.text} />
        </Pressable>
        <ThemedText type="h4" numberOfLines={1} style={styles.headerTitle}>
          Task Details
        </ThemedText>
        <View style={styles.headerButton} />
      </View>

      <ScreenScrollView contentContainerStyle={styles.content}>
        <View style={[styles.statusBanner, getStatusBannerStyle()]}>
          <StatusBadge status={task.status} />
          <ThemedText type="small" style={{ color: getStatusBannerStyle().borderColor }}>
            {getStatusText()}
          </ThemedText>
        </View>

        <View style={[styles.card, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="h3" style={styles.taskTitle}>{task.title}</ThemedText>
          
          <View style={styles.metaRow}>
            <Feather name="map-pin" size={16} color={theme.textSecondary} />
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {task.areaDescription || task.zipCode || "Location not specified"}
            </ThemedText>
          </View>
          
          {(task.status === "assigned" || task.status === "worker_marked_done" || task.status === "completed") && task.fullAddress && isHelper ? (
            <View style={[styles.metaRow, { marginTop: Spacing.sm, backgroundColor: theme.backgroundSecondary, paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs, borderRadius: BorderRadius.sm }]}>
              <Feather name="lock" size={14} color={theme.primary} />
              <View style={{ flex: 1 }}>
                <ThemedText type="caption" style={{ color: theme.textSecondary, marginBottom: 2 }}>
                  Exact address (accepted helper only)
                </ThemedText>
                <ThemedText type="small" style={{ color: theme.text, fontWeight: "500" }}>
                  {task.fullAddress}
                </ThemedText>
              </View>
            </View>
          ) : null}
          
          <View style={styles.metaRow}>
            <Feather name="tag" size={16} color={theme.textSecondary} />
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {task.category}
            </ThemedText>
          </View>

          <View style={[styles.priceContainer, { backgroundColor: theme.backgroundSecondary }]}>
            <ThemedText type="h2" style={{ color: theme.primary }}>
              ${task.price.toFixed(2)}
            </ThemedText>
            {totalExtraPaid > 0 ? (
              <ThemedText type="caption" style={{ color: theme.success }}>
                + ${totalExtraPaid.toFixed(2)} extra work
              </ThemedText>
            ) : null}
            {task.tipAmount ? (
              <ThemedText type="caption" style={{ color: theme.success }}>
                + ${task.tipAmount.toFixed(2)} tip
              </ThemedText>
            ) : null}
            {isHelper ? (
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                You'll earn ${helperEarnings.toFixed(2)}
              </ThemedText>
            ) : null}
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="h4" style={styles.sectionTitle}>Description</ThemedText>
          <ThemedText type="body" style={{ color: theme.textSecondary }}>
            {task.description}
          </ThemedText>
        </View>

        {task.photos && task.photos.length > 0 ? (
          <View style={[styles.card, { backgroundColor: theme.backgroundDefault }]}>
            <ThemedText type="h4" style={styles.sectionTitle}>
              Photos ({task.photos.length})
            </ThemedText>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={styles.photoGallery}
            >
              {task.photos.map((photo, index) => (
                <Pressable 
                  key={`task-photo-${index}`} 
                  onPress={() => setSelectedPhotoIndex(index)}
                >
                  <Image 
                    source={{ uri: photo }} 
                    style={styles.galleryThumbnail} 
                  />
                </Pressable>
              ))}
            </ScrollView>
          </View>
        ) : null}

        {isPoster && task.fullAddress ? (
          <View style={[styles.card, { backgroundColor: theme.backgroundDefault }]}>
            <ThemedText type="h4" style={styles.sectionTitle}>Full Address</ThemedText>
            <ThemedText type="body" style={{ color: theme.text, fontWeight: "500" }}>
              {task.fullAddress}
            </ThemedText>
          </View>
        ) : null}

        {/* Show contact info when helper has been hired - covers all post-hire states */}
        {["assigned", "accepted", "in_progress", "worker_marked_done", "completed", "disputed"].includes(task.status) && task.helperName ? (
          <View style={[styles.card, { backgroundColor: theme.backgroundDefault }]}>
            <ThemedText type="h4" style={styles.sectionTitle}>
              {isPoster ? "Helper" : "Poster"}
            </ThemedText>
            <View style={styles.userRow}>
              <View style={[styles.avatar, { backgroundColor: AVATAR_COLORS[Math.floor(Math.random() * 6)] }]}>
                <ThemedText type="body" style={styles.avatarText}>
                  {(isPoster ? task.helperName : task.posterName)?.charAt(0).toUpperCase()}
                </ThemedText>
              </View>
              <View style={styles.userInfo}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <ThemedText type="body">
                    {isPoster ? task.helperName : task.posterName}
                  </ThemedText>
                  {(isPoster ? task.helperPhoneVerified : task.posterPhoneVerified) ? (
                    <VerifiedBadge size="small" />
                  ) : null}
                </View>
                {(isPoster ? task.helperPhone : task.posterPhone) ? (
                  <Pressable 
                    onPress={() => {
                      const phone = isPoster ? task.helperPhone : task.posterPhone;
                      if (phone) {
                        try {
                          Linking.openURL(`tel:${phone}`);
                        } catch (error) {
                          console.log("Cannot make call");
                        }
                      }
                    }}
                    style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1, flexDirection: "row", alignItems: "center", marginTop: Spacing.xs }]}
                  >
                    <Feather name="phone" size={14} color={theme.primary} />
                    <ThemedText type="small" style={{ color: theme.primary, marginLeft: Spacing.xs }}>
                      {isPoster ? task.helperPhone : task.posterPhone}
                    </ThemedText>
                  </Pressable>
                ) : (
                  <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                    {isPoster ? "Your helper" : "Task owner"}
                  </ThemedText>
                )}
              </View>
            </View>
          </View>
        ) : null}

        {pendingExtraRequests.length > 0 && isPoster ? (
          <View style={[styles.card, { backgroundColor: theme.warning + "15", borderWidth: 1, borderColor: theme.warning }]}>
            <View style={styles.cardHeader}>
              <Feather name="alert-circle" size={20} color={theme.warning} />
              <ThemedText type="h4" style={{ color: theme.warning }}>Extra Work Request</ThemedText>
            </View>
            {pendingExtraRequests.map((request) => (
              <View key={request.id} style={styles.extraWorkItem}>
                <ThemedText type="body" style={{ marginBottom: Spacing.sm }}>
                  Helper requested <ThemedText type="body" style={{ fontWeight: "700", color: theme.primary }}>+${request.amount.toFixed(2)}</ThemedText> for additional work
                </ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.md }}>
                  "{request.reason}"
                </ThemedText>
                <View style={styles.buttonRow}>
                  <Pressable
                    onPress={() => handleDeclineExtraWork(request.id)}
                    style={({ pressed }) => [
                      styles.declineButton,
                      { borderColor: theme.error, opacity: pressed ? 0.8 : 1 },
                    ]}
                    disabled={isLoading}
                  >
                    <ThemedText type="body" style={{ color: theme.error, fontWeight: "600" }}>
                      Decline
                    </ThemedText>
                  </Pressable>
                  <Pressable
                    onPress={() => handleAcceptExtraWork(request.id)}
                    style={({ pressed }) => [
                      styles.actionButton,
                      { backgroundColor: theme.success, opacity: pressed ? 0.9 : 1, flex: 1 },
                    ]}
                    disabled={isLoading}
                  >
                    <Feather name="check" size={18} color="#FFFFFF" />
                    <ThemedText type="body" style={styles.actionButtonText}>
                      Accept & Pay
                    </ThemedText>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        ) : null}

        {extraWorkRequests.filter(r => r.status === "paid").length > 0 ? (
          <View style={[styles.card, { backgroundColor: theme.success + "10" }]}>
            <ThemedText type="h4" style={styles.sectionTitle}>Extra Work Paid</ThemedText>
            {extraWorkRequests.filter(r => r.status === "paid").map((request) => (
              <View key={request.id} style={styles.paidExtraItem}>
                <Feather name="check-circle" size={16} color={theme.success} />
                <View style={{ flex: 1 }}>
                  <ThemedText type="body" style={{ color: theme.success }}>
                    +${request.amount.toFixed(2)}
                  </ThemedText>
                  <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                    {request.reason}
                  </ThemedText>
                </View>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.infoCard}>
          <Feather name="info" size={16} color={theme.primary} />
          <ThemedText type="caption" style={{ color: theme.textSecondary, flex: 1 }}>
            {isHelper
              ? "Payment is held securely and released to you once the poster confirms completion."
              : "Your payment is held securely until you confirm the task is complete."}
          </ThemedText>
        </View>

        {task.status === "paid_waiting" && userMode === "helper" && !isMyTask ? (
          <SafetyBanner variant="fraud" />
        ) : null}
      </ScreenScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.md }]}>
        {task.status === "unpaid" && isPoster && isMyTask ? (
          <Pressable
            onPress={handleGoToPayment}
            style={({ pressed }) => [
              styles.actionButton,
              { backgroundColor: theme.primary, opacity: pressed ? 0.9 : 1 },
            ]}
          >
            <Feather name="credit-card" size={20} color="#FFFFFF" />
            <ThemedText type="body" style={styles.actionButtonText}>
              Pay & Post Task
            </ThemedText>
          </Pressable>
        ) : null}

        {task.status === "paid_waiting" && userMode === "helper" && !isMyTask ? (
          <Pressable
            onPress={handleSendOffer}
            style={({ pressed }) => [
              styles.actionButton,
              { backgroundColor: theme.primary, opacity: pressed ? 0.9 : 1 },
            ]}
          >
            <Feather name="send" size={20} color="#FFFFFF" />
            <ThemedText type="body" style={styles.actionButtonText}>
              Send Offer
            </ThemedText>
          </Pressable>
        ) : null}

        {(task.status === "assigned" || task.status === "accepted" || task.status === "in_progress") && isMyTask ? (
          <View style={styles.buttonRow}>
            <Pressable
              onPress={handleMessage}
              style={({ pressed }) => [
                styles.secondaryButton,
                { backgroundColor: theme.backgroundDefault, opacity: pressed ? 0.9 : 1 },
              ]}
            >
              <Feather name="message-circle" size={20} color={theme.primary} />
              <ThemedText type="body" style={{ color: theme.primary, fontWeight: "600" }}>
                Message
              </ThemedText>
            </Pressable>
            
            {isPoster ? (
              <Pressable
                onPress={handleApproveWork}
                style={({ pressed }) => [
                  styles.actionButton,
                  { backgroundColor: theme.success, opacity: pressed ? 0.9 : 1, flex: 1 },
                ]}
              >
                <Feather name="check" size={20} color="#FFFFFF" />
                <ThemedText type="body" style={styles.actionButtonText}>
                  Awaiting Completion
                </ThemedText>
              </Pressable>
            ) : (
              <View style={{ flex: 1, flexDirection: "row", gap: Spacing.sm }}>
                <Pressable
                  onPress={() => setShowExtraWorkModal(true)}
                  style={({ pressed }) => [
                    styles.extraWorkButton,
                    { borderColor: theme.warning, opacity: pressed ? 0.9 : 1 },
                  ]}
                >
                  <Feather name="plus-circle" size={18} color={theme.warning} />
                </Pressable>
                <Pressable
                  onPress={handleMarkJobDone}
                  style={({ pressed }) => [
                    styles.actionButton,
                    { backgroundColor: theme.primary, opacity: pressed ? 0.9 : 1, flex: 1 },
                  ]}
                >
                  <Feather name="camera" size={20} color="#FFFFFF" />
                  <ThemedText type="body" style={styles.actionButtonText}>
                    Mark Done
                  </ThemedText>
                </Pressable>
              </View>
            )}
          </View>
        ) : null}

        {task.status === "worker_marked_done" && isPoster && isMyTask ? (
          <View style={styles.buttonRow}>
            <Pressable
              onPress={handleMessage}
              style={({ pressed }) => [
                styles.secondaryButton,
                { backgroundColor: theme.backgroundDefault, opacity: pressed ? 0.9 : 1 },
              ]}
            >
              <Feather name="message-circle" size={20} color={theme.primary} />
              <ThemedText type="body" style={{ color: theme.primary, fontWeight: "600" }}>
                Message
              </ThemedText>
            </Pressable>

            <Pressable
              onPress={handleApproveWork}
              style={({ pressed }) => [
                styles.actionButton,
                { backgroundColor: theme.primary, opacity: pressed ? 0.9 : 1, flex: 1 },
              ]}
            >
              <Feather name="eye" size={20} color="#FFFFFF" />
              <ThemedText type="body" style={styles.actionButtonText}>
                Review Work
              </ThemedText>
            </Pressable>
          </View>
        ) : null}

        {task.status === "disputed" && isMyTask ? (
          <View style={styles.buttonRow}>
            <Pressable
              onPress={handleMessage}
              style={({ pressed }) => [
                styles.actionButton,
                { backgroundColor: theme.primary, opacity: pressed ? 0.9 : 1, flex: 1 },
              ]}
            >
              <Feather name="message-circle" size={20} color="#FFFFFF" />
              <ThemedText type="body" style={styles.actionButtonText}>
                Discuss with {isPoster ? "Helper" : "Poster"}
              </ThemedText>
            </Pressable>
          </View>
        ) : null}

        {task.status === "completed" ? (
          <View>
            <View style={[styles.completedBanner, { backgroundColor: theme.success + "15" }]}>
              <Feather name="check-circle" size={24} color={theme.success} />
              <ThemedText type="body" style={{ color: theme.success, fontWeight: "600" }}>
                Task Completed Successfully
              </ThemedText>
            </View>
            {isPoster && !task.tipAmount ? (
              <Pressable
                onPress={() => setShowTipModal(true)}
                style={({ pressed }) => [
                  styles.tipButton,
                  { backgroundColor: theme.primary + "15", borderColor: theme.primary, opacity: pressed ? 0.9 : 1 },
                ]}
              >
                <Feather name="heart" size={20} color={theme.primary} />
                <ThemedText type="body" style={{ color: theme.primary, fontWeight: "600" }}>
                  Leave a Tip
                </ThemedText>
              </Pressable>
            ) : null}
            {task.tipAmount ? (
              <View style={[styles.tipBadge, { backgroundColor: theme.success + "15" }]}>
                <Feather name="heart" size={16} color={theme.success} />
                <ThemedText type="body" style={{ color: theme.success }}>
                  {isPoster ? "You tipped" : "You received a tip of"} ${task.tipAmount.toFixed(2)}
                </ThemedText>
              </View>
            ) : null}
          </View>
        ) : null}
      </View>

      <Modal
        visible={showExtraWorkModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowExtraWorkModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundDefault }]}>
            <View style={styles.modalHeader}>
              <ThemedText type="h3">Request Extra Payment</ThemedText>
              <Pressable onPress={() => setShowExtraWorkModal(false)}>
                <Feather name="x" size={24} color={theme.text} />
              </Pressable>
            </View>
            
            <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.lg }}>
              If the job requires more work than described, you can request additional payment from the poster.
            </ThemedText>

            <ThemedText type="body" style={{ marginBottom: Spacing.sm }}>Extra Amount ($)</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border }]}
              placeholder="e.g. 20"
              placeholderTextColor={theme.textSecondary}
              keyboardType="decimal-pad"
              value={extraAmount}
              onChangeText={setExtraAmount}
            />

            <ThemedText type="body" style={{ marginBottom: Spacing.sm, marginTop: Spacing.md }}>Reason</ThemedText>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border }]}
              placeholder="Explain what additional work is needed..."
              placeholderTextColor={theme.textSecondary}
              multiline
              numberOfLines={4}
              value={extraReason}
              onChangeText={setExtraReason}
            />

            <Pressable
              onPress={handleRequestExtraWork}
              style={({ pressed }) => [
                styles.actionButton,
                { backgroundColor: theme.primary, opacity: pressed ? 0.9 : 1, marginTop: Spacing.xl },
              ]}
              disabled={isLoading}
            >
              <ThemedText type="body" style={styles.actionButtonText}>
                {isLoading ? "Sending..." : "Send Request"}
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showTipModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTipModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundDefault }]}>
            <View style={styles.modalHeader}>
              <ThemedText type="h3">Leave a Tip</ThemedText>
              <Pressable onPress={() => setShowTipModal(false)}>
                <Feather name="x" size={24} color={theme.text} />
              </Pressable>
            </View>
            
            <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.lg }}>
              Show your appreciation for a job well done! 100% of the tip goes to the helper.
            </ThemedText>

            <View style={styles.tipAmountRow}>
              {TIP_AMOUNTS.map((amount) => (
                <Pressable
                  key={amount}
                  onPress={() => { setTipAmount(amount.toString()); setCustomTip(""); }}
                  style={[
                    styles.tipAmountButton,
                    { 
                      backgroundColor: tipAmount === amount.toString() ? theme.primary : theme.backgroundSecondary,
                      borderColor: tipAmount === amount.toString() ? theme.primary : theme.border,
                    },
                  ]}
                >
                  <ThemedText type="body" style={{ color: tipAmount === amount.toString() ? "#FFFFFF" : theme.text, fontWeight: "600" }}>
                    ${amount}
                  </ThemedText>
                </Pressable>
              ))}
              <Pressable
                onPress={() => setTipAmount("custom")}
                style={[
                  styles.tipAmountButton,
                  { 
                    backgroundColor: tipAmount === "custom" ? theme.primary : theme.backgroundSecondary,
                    borderColor: tipAmount === "custom" ? theme.primary : theme.border,
                  },
                ]}
              >
                <ThemedText type="body" style={{ color: tipAmount === "custom" ? "#FFFFFF" : theme.text, fontWeight: "600" }}>
                  Other
                </ThemedText>
              </Pressable>
            </View>

            {tipAmount === "custom" ? (
              <TextInput
                style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border, marginTop: Spacing.md }]}
                placeholder="Enter amount"
                placeholderTextColor={theme.textSecondary}
                keyboardType="decimal-pad"
                value={customTip}
                onChangeText={setCustomTip}
              />
            ) : null}

            <Pressable
              onPress={handleSendTip}
              style={({ pressed }) => [
                styles.actionButton,
                { backgroundColor: theme.primary, opacity: pressed ? 0.9 : 1, marginTop: Spacing.xl },
              ]}
              disabled={isLoading || (!tipAmount || (tipAmount === "custom" && !customTip))}
            >
              <Feather name="heart" size={18} color="#FFFFFF" />
              <ThemedText type="body" style={styles.actionButtonText}>
                {isLoading ? "Processing..." : `Send Tip${tipAmount && tipAmount !== "custom" ? ` ($${tipAmount})` : customTip ? ` ($${customTip})` : ""}`}
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={selectedPhotoIndex !== null}
        animationType="fade"
        transparent
        onRequestClose={() => setSelectedPhotoIndex(null)}
        onShow={() => {
          if (photoViewerRef.current && selectedPhotoIndex !== null) {
            setTimeout(() => {
              photoViewerRef.current?.scrollTo({ x: selectedPhotoIndex * SCREEN_WIDTH, animated: false });
            }, 50);
          }
        }}
      >
        <View style={styles.photoViewerOverlay}>
          <Pressable 
            style={styles.photoViewerCloseButton}
            onPress={() => setSelectedPhotoIndex(null)}
          >
            <Feather name="x" size={28} color="#FFFFFF" />
          </Pressable>
          
          {selectedPhotoIndex !== null && task.photos && task.photos.length > 0 ? (
            <ScrollView 
              ref={photoViewerRef}
              horizontal 
              pagingEnabled 
              showsHorizontalScrollIndicator={false}
              style={styles.photoViewerScroll}
              onMomentumScrollEnd={(e) => {
                const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
                setSelectedPhotoIndex(index);
              }}
            >
              {task.photos.map((photo, index) => (
                <View key={`fullscreen-${index}`} style={[styles.fullPhotoContainer, { width: SCREEN_WIDTH }]}>
                  <Image 
                    source={{ uri: photo }} 
                    style={styles.fullPhoto}
                    resizeMode="contain"
                  />
                </View>
              ))}
            </ScrollView>
          ) : null}
          
          {task.photos && task.photos.length > 1 ? (
            <View style={styles.photoCounter}>
              <ThemedText type="caption" style={{ color: "#FFFFFF" }}>
                {(selectedPhotoIndex ?? 0) + 1} / {task.photos.length}
              </ThemedText>
            </View>
          ) : null}
        </View>
      </Modal>

      <HelperWaiverModal
        visible={showHelperWaiverModal}
        onAccept={handleHelperWaiverAccept}
        onDecline={handleHelperWaiverDecline}
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
    justifyContent: "space-between",
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  headerButton: {
    width: 40,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
  },
  content: {
    paddingTop: 0,
  },
  statusBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  card: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  taskTitle: {
    marginBottom: Spacing.md,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  priceContainer: {
    marginTop: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
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
  userInfo: {
    marginLeft: Spacing.md,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
    padding: Spacing.lg,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
  },
  actionButton: {
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  buttonRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  secondaryButton: {
    height: Spacing.buttonHeight,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  completedBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  extraWorkItem: {
    paddingTop: Spacing.sm,
  },
  declineButton: {
    height: Spacing.buttonHeight,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  paidExtraItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  extraWorkButton: {
    width: 48,
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tipButton: {
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  tipBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  input: {
    height: 48,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    paddingTop: Spacing.md,
    textAlignVertical: "top",
  },
  tipAmountRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  tipAmountButton: {
    flex: 1,
    height: 48,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  photoGallery: {
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  galleryThumbnail: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.md,
  },
  photoViewerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  photoViewerCloseButton: {
    position: "absolute",
    top: 60,
    right: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  photoViewerScroll: {
    flex: 1,
  },
  fullPhotoContainer: {
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  fullPhoto: {
    width: "100%",
    height: "80%",
  },
  photoCounter: {
    position: "absolute",
    bottom: 60,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
});
