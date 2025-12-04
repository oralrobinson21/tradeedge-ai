import React, { useState } from "react";
import { View, StyleSheet, Pressable, Alert, ActivityIndicator, Image, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/types";
import { useApp } from "@/context/AppContext";

type CompletionPhotoScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "CompletionPhoto">;
  route: RouteProp<RootStackParamList, "CompletionPhoto">;
};

export default function CompletionPhotoScreen({ navigation, route }: CompletionPhotoScreenProps) {
  const { task } = route.params;
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { markJobDone } = useApp();

  const [beforePhoto, setBeforePhoto] = useState<string | null>(null);
  const [afterPhoto, setAfterPhoto] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pickImage = async (type: "before" | "after") => {
    if (Platform.OS === "web") {
      Alert.alert("Not Available", "Photo upload is not available on web. Please use Expo Go on a physical device.");
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        if (type === "before") {
          setBeforePhoto(result.assets[0].uri);
        } else {
          setAfterPhoto(result.assets[0].uri);
        }
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const handleSubmit = async () => {
    if (!afterPhoto) {
      Alert.alert("Required", "Please upload an after photo");
      return;
    }

    setIsSubmitting(true);
    try {
      await markJobDone(task.id, beforePhoto || undefined, afterPhoto);
      Alert.alert("Success", "Job marked as done. Waiting for customer approval.", [
        {
          text: "OK",
          onPress: () => navigation.reset({
            index: 0,
            routes: [{ name: "Main" }],
          }),
        },
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to mark job done");
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
        <ThemedText type="h4">Completion Photos</ThemedText>
        <View style={styles.headerButton} />
      </View>

      <ScreenScrollView contentContainerStyle={styles.content}>
        <ThemedText type="h3" style={styles.title}>{task.title}</ThemedText>

        <View style={[styles.infoBox, { backgroundColor: theme.backgroundDefault }]}>
          <Feather name="info" size={16} color={theme.primary} />
          <ThemedText type="caption" style={{ flex: 1, color: theme.textSecondary }}>
            Upload photos showing your work. After photo is required to mark the job as done.
          </ThemedText>
        </View>

        <View style={styles.photoSection}>
          <ThemedText type="h4" style={styles.sectionTitle}>Before Photo (Optional)</ThemedText>
          {beforePhoto ? (
            <View style={styles.photoContainer}>
              <Image source={{ uri: beforePhoto }} style={styles.photo} />
              <Pressable
                onPress={() => setBeforePhoto(null)}
                style={({ pressed }) => [styles.removeButton, { opacity: pressed ? 0.7 : 1 }]}
              >
                <Feather name="x" size={20} color="#FFFFFF" />
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={() => pickImage("before")}
              style={({ pressed }) => [
                styles.uploadButton,
                { backgroundColor: theme.backgroundDefault, opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Feather name="camera" size={32} color={theme.textSecondary} />
              <ThemedText type="body" style={{ color: theme.textSecondary, marginTop: Spacing.sm }}>
                Choose before photo
              </ThemedText>
            </Pressable>
          )}
        </View>

        <View style={styles.photoSection}>
          <ThemedText type="h4" style={styles.sectionTitle}>After Photo (Required)</ThemedText>
          {afterPhoto ? (
            <View style={styles.photoContainer}>
              <Image source={{ uri: afterPhoto }} style={styles.photo} />
              <Pressable
                onPress={() => setAfterPhoto(null)}
                style={({ pressed }) => [styles.removeButton, { opacity: pressed ? 0.7 : 1 }]}
              >
                <Feather name="x" size={20} color="#FFFFFF" />
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={() => pickImage("after")}
              style={({ pressed }) => [
                styles.uploadButton,
                {
                  backgroundColor: theme.primary,
                  borderColor: theme.primary,
                  opacity: pressed ? 0.9 : 1,
                },
              ]}
            >
              <Feather name="camera" size={32} color="#FFFFFF" />
              <ThemedText type="body" style={{ color: "#FFFFFF", marginTop: Spacing.sm }}>
                Choose after photo
              </ThemedText>
            </Pressable>
          )}
        </View>
      </ScreenScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.md }]}>
        <Pressable
          onPress={handleSubmit}
          disabled={isSubmitting || !afterPhoto}
          style={({ pressed }) => [
            styles.submitButton,
            {
              backgroundColor: !afterPhoto ? theme.textSecondary : theme.primary,
              opacity: pressed ? 0.9 : 1,
            },
          ]}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Feather name="check" size={20} color="#FFFFFF" />
              <ThemedText type="body" style={styles.submitButtonText}>
                Mark Job Done
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
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  photoSection: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  uploadButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing["2xl"],
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "rgba(0, 0, 0, 0.1)",
  },
  photoContainer: {
    position: "relative",
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  photo: {
    width: "100%",
    height: 300,
  },
  removeButton: {
    position: "absolute",
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
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
