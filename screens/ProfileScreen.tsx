import React, { useState } from "react";
import { View, StyleSheet, Pressable, Alert, Platform, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ThemedText } from "@/components/ThemedText";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import { PLATFORM_FEE_PERCENT } from "@/types";
import { RootStackParamList } from "@/navigation/types";

const AVATAR_COLORS = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD"];

export default function ProfileScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, tasks, logout, userMode, setUserMode, updateProfilePhoto } = useApp();
  const [isUploading, setIsUploading] = useState(false);
  const [licenseUrls, setLicenseUrls] = useState<string[]>(
    user?.licenses?.map(l => l.imageUrl) ?? []
  );
  const [isUploadingLicense, setIsUploadingLicense] = useState(false);
  const isPhoneVerified = user?.isPhoneVerified ?? false;
  const hasLicenses = licenseUrls.length > 0;

  const allTasks = tasks ?? [];
  const isHelperMode = userMode === "helper";
  
  const completedTasks = isHelperMode
    ? allTasks.filter(task => task.helperId === user?.id && task.status === "completed")
    : allTasks.filter(task => task.posterId === user?.id && task.status === "completed");

  const totalEarnings = isHelperMode
    ? completedTasks.reduce((sum, task) => sum + task.price * (1 - PLATFORM_FEE_PERCENT), 0)
    : completedTasks.reduce((sum, task) => sum + task.price * (1 + PLATFORM_FEE_PERCENT), 0);

  const handleSwitchMode = () => {
    const newMode = isHelperMode ? "poster" : "helper";
    Alert.alert(
      "Switch View",
      `Switch to ${isHelperMode ? "Poster" : "Helper"} view?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Switch", onPress: () => setUserMode(newMode) },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Log Out", style: "destructive", onPress: logout },
      ]
    );
  };

  const handlePickPhoto = async () => {
    if (Platform.OS === "web") {
      Alert.alert("Not Available", "Photo upload is available in the Expo Go app.");
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Please allow access to your photos to upload a profile picture.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setIsUploading(true);
      try {
        await updateProfilePhoto(result.assets[0].uri);
        Alert.alert("Success", "Profile photo updated!");
      } catch (error) {
        Alert.alert("Error", "Failed to update profile photo. Please try again.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleTakePhoto = async () => {
    if (Platform.OS === "web") {
      Alert.alert("Not Available", "Camera is available in the Expo Go app.");
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Please allow camera access to take a profile photo.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setIsUploading(true);
      try {
        await updateProfilePhoto(result.assets[0].uri);
        Alert.alert("Success", "Profile photo updated!");
      } catch (error) {
        Alert.alert("Error", "Failed to update profile photo. Please try again.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleChangePhoto = () => {
    Alert.alert(
      "Change Profile Photo",
      "How would you like to add a photo?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Take Photo", onPress: handleTakePhoto },
        { text: "Choose from Library", onPress: handlePickPhoto },
      ]
    );
  };

  const handleUploadLicense = async () => {
    if (Platform.OS === "web") {
      Alert.alert("Not Available", "License upload is available in the Expo Go app.");
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Please allow access to your photos to upload a license.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setIsUploadingLicense(true);
      try {
        setLicenseUrls(prev => [...prev, result.assets[0].uri]);
        Alert.alert("Success", "License uploaded! It will be reviewed within 24 hours.");
      } catch (error) {
        Alert.alert("Error", "Failed to upload license. Please try again.");
      } finally {
        setIsUploadingLicense(false);
      }
    }
  };

  const handleTakeLicensePhoto = async () => {
    if (Platform.OS === "web") {
      Alert.alert("Not Available", "Camera is available in the Expo Go app.");
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Please allow camera access to take a license photo.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setIsUploadingLicense(true);
      try {
        setLicenseUrls(prev => [...prev, result.assets[0].uri]);
        Alert.alert("Success", "License uploaded! It will be reviewed within 24 hours.");
      } catch (error) {
        Alert.alert("Error", "Failed to upload license. Please try again.");
      } finally {
        setIsUploadingLicense(false);
      }
    }
  };

  const handleAddLicense = () => {
    Alert.alert(
      "Add License",
      "Upload a photo of your professional license or certification (plumber, electrician, etc.)",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Take Photo", onPress: handleTakeLicensePhoto },
        { text: "Choose from Library", onPress: handleUploadLicense },
      ]
    );
  };

  const handleRemoveLicense = (index: number) => {
    Alert.alert(
      "Remove License",
      "Are you sure you want to remove this license?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Remove", 
          style: "destructive",
          onPress: () => setLicenseUrls(prev => prev.filter((_, i) => i !== index))
        },
      ]
    );
  };

  const avatarIndex = user?.id ? user.id.charCodeAt(0) : 0;
  const avatarColor = AVATAR_COLORS[avatarIndex % 6];
  const hasProfilePhoto = !!user?.profilePhotoUrl;

  return (
    <ScreenScrollView>
      <View style={styles.header}>
        <Pressable onPress={handleChangePhoto} disabled={isUploading}>
          <View style={[styles.avatarContainer, { backgroundColor: avatarColor }]}>
            {hasProfilePhoto ? (
              <Image
                source={{ uri: user.profilePhotoUrl }}
                style={styles.avatarImage}
                contentFit="cover"
              />
            ) : (
              <ThemedText type="h1" style={styles.avatarText}>
                {(user?.name ?? "U").charAt(0).toUpperCase()}
              </ThemedText>
            )}
            <View style={[styles.editBadge, { backgroundColor: theme.primary }]}>
              <Feather name={isUploading ? "loader" : "camera"} size={14} color="#FFFFFF" />
            </View>
          </View>
        </Pressable>
        
        {!hasProfilePhoto ? (
          <ThemedText type="caption" style={[styles.photoHint, { color: theme.textSecondary }]}>
            Tap to add a profile photo
          </ThemedText>
        ) : null}
        
        <View style={styles.nameRow}>
          <ThemedText type="h2" style={styles.name}>
            {user?.name || "User"}
          </ThemedText>
          {isPhoneVerified ? <VerifiedBadge size="medium" /> : null}
        </View>
        <View style={[styles.roleBadge, { backgroundColor: isHelperMode ? theme.secondary : theme.primary }]}>
          <Feather name={isHelperMode ? "tool" : "briefcase"} size={14} color="#FFFFFF" />
          <ThemedText type="caption" style={styles.roleBadgeText}>
            {isHelperMode ? "Helper" : "Poster"}
          </ThemedText>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.statItem, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="h2" style={{ color: theme.primary }}>
            {completedTasks.length}
          </ThemedText>
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>
            {isHelperMode ? "Jobs Done" : "Tasks Posted"}
          </ThemedText>
        </View>
        <View style={[styles.statItem, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="h2" style={{ color: theme.primary }}>
            ${totalEarnings.toFixed(0)}
          </ThemedText>
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>
            {isHelperMode ? "Earned" : "Spent"}
          </ThemedText>
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Account
        </ThemedText>
        
        <Pressable
          onPress={handleSwitchMode}
          style={({ pressed }) => [
            styles.menuItem,
            { backgroundColor: pressed ? theme.backgroundDefault : theme.backgroundRoot },
          ]}
        >
          <View style={[styles.menuIconContainer, { backgroundColor: theme.secondary + "20" }]}>
            <Feather name="repeat" size={20} color={theme.secondary} />
          </View>
          <View style={styles.menuContent}>
            <ThemedText type="body">Switch to {isHelperMode ? "Poster" : "Helper"}</ThemedText>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              {isHelperMode ? "Post tasks and get help" : "Accept jobs and earn money"}
            </ThemedText>
          </View>
          <Feather name="chevron-right" size={20} color={theme.textSecondary} />
        </Pressable>

        <View style={[styles.separator, { backgroundColor: theme.border }]} />

        <Pressable
          onPress={handleChangePhoto}
          style={({ pressed }) => [
            styles.menuItem,
            { backgroundColor: pressed ? theme.backgroundDefault : theme.backgroundRoot },
          ]}
        >
          <View style={[styles.menuIconContainer, { backgroundColor: theme.primary + "20" }]}>
            <Feather name="camera" size={20} color={theme.primary} />
          </View>
          <View style={styles.menuContent}>
            <ThemedText type="body">Profile Photo</ThemedText>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              {hasProfilePhoto ? "Change your photo" : "Required for posting/accepting jobs"}
            </ThemedText>
          </View>
          <Feather name="chevron-right" size={20} color={theme.textSecondary} />
        </Pressable>

        <View style={[styles.separator, { backgroundColor: theme.border }]} />

        <Pressable
          style={({ pressed }) => [
            styles.menuItem,
            { backgroundColor: pressed ? theme.backgroundDefault : theme.backgroundRoot },
          ]}
        >
          <View style={[styles.menuIconContainer, { backgroundColor: theme.primary + "20" }]}>
            <Feather name="credit-card" size={20} color={theme.primary} />
          </View>
          <View style={styles.menuContent}>
            <ThemedText type="body">Payment Methods</ThemedText>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              Manage your cards
            </ThemedText>
          </View>
          <Feather name="chevron-right" size={20} color={theme.textSecondary} />
        </Pressable>

        <View style={[styles.separator, { backgroundColor: theme.border }]} />

        <Pressable
          onPress={() => navigation.navigate("VerifyPhone")}
          style={({ pressed }) => [
            styles.menuItem,
            { backgroundColor: pressed ? theme.backgroundDefault : theme.backgroundRoot },
          ]}
        >
          <View style={[styles.menuIconContainer, { backgroundColor: isPhoneVerified ? "#3B82F620" : theme.secondary + "20" }]}>
            <Feather name="phone" size={20} color={isPhoneVerified ? "#3B82F6" : theme.secondary} />
          </View>
          <View style={styles.menuContent}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <ThemedText type="body">Phone Verification</ThemedText>
              {isPhoneVerified ? <VerifiedBadge size="small" /> : null}
            </View>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              {isPhoneVerified ? "Verified" : "Verify to unlock tasks over $40"}
            </ThemedText>
          </View>
          <Feather name="chevron-right" size={20} color={theme.textSecondary} />
        </Pressable>
      </View>

      {isHelperMode ? (
        <View style={styles.section}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            Licenses & Certifications
          </ThemedText>
          <ThemedText type="caption" style={[styles.sectionDescription, { color: theme.textSecondary }]}>
            Upload professional licenses to apply for jobs that require them
          </ThemedText>

          {hasLicenses ? (
            <View style={styles.licenseGrid}>
              {licenseUrls.map((licenseUrl, index) => (
                <View key={`license-${index}`} style={styles.licenseItem}>
                  <Image
                    source={{ uri: licenseUrl }}
                    style={[styles.licenseThumbnail, { borderColor: theme.border }]}
                    contentFit="cover"
                  />
                  <Pressable
                    onPress={() => handleRemoveLicense(index)}
                    style={[styles.removeLicenseButton, { backgroundColor: theme.error }]}
                  >
                    <Feather name="x" size={12} color="#FFFFFF" />
                  </Pressable>
                  <View style={[styles.licenseBadge, { backgroundColor: theme.success + "20" }]}>
                    <Feather name="check-circle" size={12} color={theme.success} />
                  </View>
                </View>
              ))}
              <Pressable
                onPress={handleAddLicense}
                disabled={isUploadingLicense}
                style={[styles.addLicenseButton, { borderColor: theme.border, backgroundColor: theme.backgroundDefault }]}
              >
                <Feather name={isUploadingLicense ? "loader" : "plus"} size={24} color={theme.textSecondary} />
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                  Add
                </ThemedText>
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={handleAddLicense}
              disabled={isUploadingLicense}
              style={({ pressed }) => [
                styles.menuItem,
                { backgroundColor: pressed ? theme.backgroundDefault : theme.backgroundRoot },
              ]}
            >
              <View style={[styles.menuIconContainer, { backgroundColor: theme.secondary + "20" }]}>
                <Feather name={isUploadingLicense ? "loader" : "file-text"} size={20} color={theme.secondary} />
              </View>
              <View style={styles.menuContent}>
                <ThemedText type="body">Add License</ThemedText>
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                  Plumber, electrician, contractor, etc.
                </ThemedText>
              </View>
              <Feather name="plus" size={20} color={theme.textSecondary} />
            </Pressable>
          )}
        </View>
      ) : null}

      <View style={styles.section}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Settings
        </ThemedText>

        <Pressable
          style={({ pressed }) => [
            styles.menuItem,
            { backgroundColor: pressed ? theme.backgroundDefault : theme.backgroundRoot },
          ]}
        >
          <View style={[styles.menuIconContainer, { backgroundColor: theme.textSecondary + "20" }]}>
            <Feather name="bell" size={20} color={theme.textSecondary} />
          </View>
          <ThemedText type="body" style={styles.menuText}>Notifications</ThemedText>
          <Feather name="chevron-right" size={20} color={theme.textSecondary} />
        </Pressable>

        <View style={[styles.separator, { backgroundColor: theme.border }]} />

        <Pressable
          onPress={() => navigation.navigate("Support")}
          style={({ pressed }) => [
            styles.menuItem,
            { backgroundColor: pressed ? theme.backgroundDefault : theme.backgroundRoot },
          ]}
        >
          <View style={[styles.menuIconContainer, { backgroundColor: theme.textSecondary + "20" }]}>
            <Feather name="help-circle" size={20} color={theme.textSecondary} />
          </View>
          <ThemedText type="body" style={styles.menuText}>Help & Support</ThemedText>
          <Feather name="chevron-right" size={20} color={theme.textSecondary} />
        </Pressable>

        <View style={[styles.separator, { backgroundColor: theme.border }]} />

        <Pressable
          style={({ pressed }) => [
            styles.menuItem,
            { backgroundColor: pressed ? theme.backgroundDefault : theme.backgroundRoot },
          ]}
        >
          <View style={[styles.menuIconContainer, { backgroundColor: theme.textSecondary + "20" }]}>
            <Feather name="shield" size={20} color={theme.textSecondary} />
          </View>
          <ThemedText type="body" style={styles.menuText}>Privacy Policy</ThemedText>
          <Feather name="chevron-right" size={20} color={theme.textSecondary} />
        </Pressable>
      </View>

      <Pressable
        onPress={handleLogout}
        style={({ pressed }) => [
          styles.logoutButton,
          { backgroundColor: theme.error + "15", opacity: pressed ? 0.8 : 1 },
        ]}
      >
        <Feather name="log-out" size={20} color={theme.error} />
        <ThemedText type="body" style={[styles.logoutText, { color: theme.error }]}>
          Log Out
        </ThemedText>
      </Pressable>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
    overflow: "hidden",
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 40,
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  photoHint: {
    marginBottom: Spacing.sm,
  },
  name: {
    marginBottom: Spacing.sm,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  roleBadgeText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  statsRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing["2xl"],
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Spacing.xl,
    borderRadius: BorderRadius.lg,
  },
  section: {
    marginBottom: Spacing["2xl"],
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    marginHorizontal: -Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  menuContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  menuText: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  separator: {
    height: 1,
    marginLeft: 56,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  logoutText: {
    fontWeight: "600",
  },
  sectionDescription: {
    marginBottom: Spacing.md,
    marginTop: -Spacing.xs,
  },
  licenseGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  licenseItem: {
    position: "relative",
    width: 80,
    height: 80,
  },
  licenseThumbnail: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  removeLicenseButton: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  licenseBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  addLicenseButton: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
  },
});
