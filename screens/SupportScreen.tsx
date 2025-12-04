import React, { useState } from "react";
import { View, StyleSheet, Pressable, TextInput, Alert, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ThemedText } from "@/components/ThemedText";
import { ScreenKeyboardAwareScrollView } from "@/components/ScreenKeyboardAwareScrollView";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { useTheme } from "@/hooks/useTheme";
import { useApp } from "@/context/AppContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/types";
import { SupportTicketCategory } from "@/types";

type SupportScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

const TICKET_CATEGORIES: { id: SupportTicketCategory; label: string; icon: string }[] = [
  { id: "payment", label: "Payment Issue", icon: "credit-card" },
  { id: "helper_issue", label: "Issue with Helper", icon: "user-x" },
  { id: "poster_issue", label: "Issue with Poster", icon: "user-x" },
  { id: "dispute", label: "Dispute Resolution", icon: "alert-triangle" },
  { id: "emergency", label: "Emergency / Safety", icon: "alert-circle" },
  { id: "app_bug", label: "App Bug / Technical", icon: "tool" },
  { id: "other", label: "Other", icon: "help-circle" },
];

export default function SupportScreen({ navigation }: SupportScreenProps) {
  const { theme } = useTheme();
  const { createSupportTicket, supportTickets, tasks, user } = useApp();
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [category, setCategory] = useState<SupportTicketCategory | null>(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const userTasks = tasks.filter(t => t.posterId === user?.id || t.helperId === user?.id);

  const handleSubmit = async () => {
    if (!category) {
      Alert.alert("Error", "Please select a category.");
      return;
    }
    if (!subject.trim()) {
      Alert.alert("Error", "Please enter a subject.");
      return;
    }
    if (!message.trim()) {
      Alert.alert("Error", "Please describe your issue.");
      return;
    }

    setIsLoading(true);
    try {
      await createSupportTicket(category, subject.trim(), message.trim(), selectedTaskId || undefined);
      Alert.alert("Success", "Your support ticket has been submitted. We'll get back to you soon.", [
        { text: "OK", onPress: () => {
          setShowNewTicket(false);
          setCategory(null);
          setSubject("");
          setMessage("");
          setSelectedTaskId(null);
        }}
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to submit ticket. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderTicket = ({ item }: { item: typeof supportTickets[0] }) => {
    const statusColor = item.status === "open" ? theme.primary : 
                        item.status === "in_review" ? theme.secondary : theme.success;
    return (
      <View style={[styles.ticketCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
        <View style={styles.ticketHeader}>
          <ThemedText type="body" style={{ fontWeight: "600", flex: 1 }}>{item.subject}</ThemedText>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + "20" }]}>
            <ThemedText type="caption" style={{ color: statusColor, fontWeight: "600" }}>
              {item.status.replace("_", " ").toUpperCase()}
            </ThemedText>
          </View>
        </View>
        <ThemedText type="caption" style={{ color: theme.textSecondary, marginTop: Spacing.xs }}>
          {new Date(item.createdAt).toLocaleDateString()}
        </ThemedText>
      </View>
    );
  };

  if (showNewTicket) {
    return (
      <ScreenKeyboardAwareScrollView>
        <View style={styles.header}>
          <Pressable 
            onPress={() => setShowNewTicket(false)} 
            style={[styles.backButton, { backgroundColor: theme.backgroundDefault }]}
          >
            <Feather name="arrow-left" size={20} color={theme.text} />
          </Pressable>
          <ThemedText type="h2">New Ticket</ThemedText>
        </View>

        <ThemedText type="body" style={{ marginBottom: Spacing.md }}>Select a category:</ThemedText>
        <View style={styles.categoryGrid}>
          {TICKET_CATEGORIES.map(cat => (
            <Pressable
              key={cat.id}
              style={[
                styles.categoryButton,
                { 
                  backgroundColor: category === cat.id ? theme.primary + "20" : theme.backgroundDefault,
                  borderColor: category === cat.id ? theme.primary : theme.border,
                }
              ]}
              onPress={() => setCategory(cat.id)}
            >
              <Feather name={cat.icon as any} size={20} color={category === cat.id ? theme.primary : theme.textSecondary} />
              <ThemedText type="caption" style={{ marginTop: Spacing.xs, textAlign: "center" }}>
                {cat.label}
              </ThemedText>
            </Pressable>
          ))}
        </View>

        {userTasks.length > 0 ? (
          <View style={styles.section}>
            <ThemedText type="body" style={{ marginBottom: Spacing.sm }}>Related task (optional):</ThemedText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.taskScrollView}
            >
              {userTasks.slice(0, 5).map(item => (
                <Pressable
                  key={item.id}
                  style={[
                    styles.taskChip,
                    { 
                      backgroundColor: selectedTaskId === item.id ? theme.primary + "20" : theme.backgroundDefault,
                      borderColor: selectedTaskId === item.id ? theme.primary : theme.border,
                    }
                  ]}
                  onPress={() => setSelectedTaskId(selectedTaskId === item.id ? null : item.id)}
                >
                  <ThemedText type="caption" numberOfLines={1}>{item.title}</ThemedText>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        ) : null}

        <View style={styles.section}>
          <ThemedText type="body" style={{ marginBottom: Spacing.sm }}>Subject:</ThemedText>
          <TextInput
            style={[styles.input, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, color: theme.text }]}
            value={subject}
            onChangeText={setSubject}
            placeholder="Brief description of your issue"
            placeholderTextColor={theme.textSecondary}
          />
        </View>

        <View style={styles.section}>
          <ThemedText type="body" style={{ marginBottom: Spacing.sm }}>Message:</ThemedText>
          <TextInput
            style={[styles.textArea, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, color: theme.text }]}
            value={message}
            onChangeText={setMessage}
            placeholder="Please describe your issue in detail..."
            placeholderTextColor={theme.textSecondary}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        <Pressable
          style={[styles.submitButton, { backgroundColor: theme.primary, opacity: isLoading ? 0.6 : 1 }]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          <ThemedText type="body" style={{ color: "#FFFFFF", fontWeight: "600" }}>
            {isLoading ? "Submitting..." : "Submit Ticket"}
          </ThemedText>
        </Pressable>
      </ScreenKeyboardAwareScrollView>
    );
  }

  return (
    <ScreenScrollView>
      <View style={styles.header}>
        <Pressable 
          onPress={() => navigation.goBack()} 
          style={[styles.backButton, { backgroundColor: theme.backgroundDefault }]}
        >
          <Feather name="arrow-left" size={20} color={theme.text} />
        </Pressable>
        <ThemedText type="h2">Help & Support</ThemedText>
      </View>

      <Pressable
        style={[styles.newTicketButton, { backgroundColor: theme.primary }]}
        onPress={() => setShowNewTicket(true)}
      >
        <Feather name="plus" size={20} color="#FFFFFF" />
        <ThemedText type="body" style={{ color: "#FFFFFF", fontWeight: "600", marginLeft: Spacing.sm }}>
          Submit a New Ticket
        </ThemedText>
      </Pressable>

      <View style={[styles.contactCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
        <View style={[styles.contactIcon, { backgroundColor: theme.primary + "20" }]}>
          <Feather name="mail" size={20} color={theme.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <ThemedText type="body" style={{ fontWeight: "600" }}>Email Support</ThemedText>
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>support@citytasks.com</ThemedText>
        </View>
      </View>

      <ThemedText type="h4" style={{ marginTop: Spacing.xl, marginBottom: Spacing.md }}>
        My Support Tickets
      </ThemedText>

      {supportTickets.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: theme.backgroundDefault }]}>
          <Feather name="inbox" size={40} color={theme.textSecondary} />
          <ThemedText type="body" style={{ color: theme.textSecondary, marginTop: Spacing.md, textAlign: "center" }}>
            No support tickets yet. If you have any issues, submit a ticket and we'll help you out.
          </ThemedText>
        </View>
      ) : (
        supportTickets.map(ticket => (
          <View key={ticket.id}>
            {renderTicket({ item: ticket })}
          </View>
        ))
      )}
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  newTicketButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.md,
  },
  contactIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  ticketCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  ticketHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  emptyState: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  categoryButton: {
    width: "30%",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: "center",
  },
  section: {
    marginBottom: Spacing.lg,
  },
  input: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
    fontSize: 16,
  },
  textArea: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
    fontSize: 16,
    minHeight: 120,
  },
  taskScrollView: {
    marginHorizontal: -Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  taskChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginRight: Spacing.sm,
    maxWidth: 150,
  },
  submitButton: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
});
