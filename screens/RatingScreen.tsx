import React, { useState } from "react";
import { View, StyleSheet, Pressable, Alert, ActivityIndicator, TextInput } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ScreenKeyboardAwareScrollView } from "@/components/ScreenKeyboardAwareScrollView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/types";
import { useApp } from "@/context/AppContext";

type RatingScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Rating">;
  route: RouteProp<RootStackParamList, "Rating">;
};

export default function RatingScreen({ navigation, route }: RatingScreenProps) {
  const { task } = route.params;
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { user, createRating } = useApp();

  const [score, setScore] = useState(0);
  const [review, setReview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!task.workerId) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>No worker assigned</ThemedText>
      </ThemedView>
    );
  }

  const handleRating = (value: number) => {
    setScore(value);
  };

  const handleSubmit = async () => {
    if (score === 0) {
      Alert.alert("Required", "Please select a star rating");
      return;
    }

    setIsSubmitting(true);
    try {
      await createRating(task.id, task.workerId, score, review);
      Alert.alert("Thank You!", "Your rating has been saved.", [
        {
          text: "Done",
          onPress: () => navigation.reset({
            index: 0,
            routes: [{ name: "Main" }],
          }),
        },
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to save rating");
    } finally {
      setIsSubmitting(false);
    }
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
        <ThemedText type="h4">Rate Worker</ThemedText>
        <View style={styles.headerButton} />
      </View>

      <ScreenKeyboardAwareScrollView contentContainerStyle={styles.content}>
        <ThemedText type="h3" style={styles.title}>How was your experience?</ThemedText>

        <View style={[styles.card, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="body" style={[styles.workerName, { marginBottom: Spacing.lg }]}>
            Rating for {task.workerName}
          </ThemedText>

          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Pressable
                key={star}
                onPress={() => handleRating(star)}
                style={({ pressed }) => [
                  styles.star,
                  { opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Feather
                  name={score >= star ? "star" : "star"}
                  size={48}
                  color={score >= star ? theme.primary : theme.textSecondary}
                  fill={score >= star ? theme.primary : "none"}
                />
              </Pressable>
            ))}
          </View>

          {score > 0 && (
            <ThemedText type="body" style={[styles.scoreText, { color: theme.primary }]}>
              {score} out of 5 stars
            </ThemedText>
          )}
        </View>

        <View style={styles.reviewSection}>
          <ThemedText type="h4" style={styles.sectionTitle}>Add a Review (Optional)</ThemedText>
          <TextInput
            style={[
              styles.reviewInput,
              {
                backgroundColor: theme.backgroundDefault,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
            value={review}
            onChangeText={setReview}
            placeholder="Share your feedback about the work..."
            placeholderTextColor={theme.textSecondary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            maxLength={500}
          />
          <ThemedText type="caption" style={{ color: theme.textSecondary, marginTop: Spacing.sm }}>
            {review.length}/500
          </ThemedText>
        </View>
      </ScreenKeyboardAwareScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.md }]}>
        <Pressable
          onPress={handleSubmit}
          disabled={isSubmitting || score === 0}
          style={({ pressed }) => [
            styles.submitButton,
            {
              backgroundColor: score === 0 ? theme.textSecondary : theme.primary,
              opacity: pressed ? 0.9 : 1,
            },
          ]}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Feather name="send" size={20} color="#FFFFFF" />
              <ThemedText type="body" style={styles.submitButtonText}>
                Submit Rating
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
  title: {
    marginBottom: Spacing.lg,
    textAlign: "center",
  },
  card: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl,
    alignItems: "center",
  },
  workerName: {
    textAlign: "center",
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.md,
  },
  star: {
    padding: Spacing.sm,
  },
  scoreText: {
    marginTop: Spacing.lg,
    fontWeight: "600",
  },
  reviewSection: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  reviewInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    minHeight: 120,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    gap: Spacing.sm,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
