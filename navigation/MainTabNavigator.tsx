import React from "react";
import { View, StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, NavigationProp } from "@react-navigation/native";

import HomeStackNavigator from "@/navigation/HomeStackNavigator";
import MessagesStackNavigator from "@/navigation/MessagesStackNavigator";
import ActivityStackNavigator from "@/navigation/ActivityStackNavigator";
import ProfileStackNavigator from "@/navigation/ProfileStackNavigator";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { useTheme } from "@/hooks/useTheme";
import { useApp } from "@/context/AppContext";
import { RootStackParamList, MainTabParamList } from "@/navigation/types";
import { Spacing } from "@/constants/theme";

const Tab = createBottomTabNavigator<MainTabParamList>();

function TabBarBackground() {
  const { isDark } = useTheme();
  
  if (Platform.OS !== "ios") return null;
  
  return (
    <BlurView
      intensity={100}
      tint={isDark ? "dark" : "light"}
      style={StyleSheet.absoluteFill}
    />
  );
}

function CustomerFAB() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[styles.fabContainer, { bottom: 60 + insets.bottom + Spacing.md }]}>
      <FloatingActionButton
        onPress={() => navigation.navigate("CreateTask")}
        icon="plus"
      />
    </View>
  );
}

export default function MainTabNavigator() {
  const { theme, isDark } = useTheme();
  const { isHelperMode } = useApp();

  return (
    <View style={styles.container}>
      <Tab.Navigator
        initialRouteName="HomeTab"
        screenOptions={{
          tabBarActiveTintColor: theme.tabIconSelected,
          tabBarInactiveTintColor: theme.tabIconDefault,
          tabBarStyle: {
            position: "absolute",
            backgroundColor: Platform.select({
              ios: "transparent",
              android: theme.backgroundRoot,
            }),
            borderTopWidth: 0,
            elevation: 0,
          },
          tabBarBackground: TabBarBackground,
          headerShown: false,
        }}
      >
        <Tab.Screen
          name="HomeTab"
          component={HomeStackNavigator}
          options={{
            title: isHelperMode ? "Jobs" : "Home",
            tabBarIcon: ({ color, size }) => (
              <Feather name={isHelperMode ? "briefcase" : "home"} size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="MessagesTab"
          component={MessagesStackNavigator}
          options={{
            title: "Messages",
            tabBarIcon: ({ color, size }) => (
              <Feather name="message-circle" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="ActivityTab"
          component={ActivityStackNavigator}
          options={{
            title: isHelperMode ? "My Jobs" : "Activity",
            tabBarIcon: ({ color, size }) => (
              <Feather name="activity" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="ProfileTab"
          component={ProfileStackNavigator}
          options={{
            title: "Profile",
            tabBarIcon: ({ color, size }) => (
              <Feather name="user" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
      
      {!isHelperMode ? <CustomerFAB /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fabContainer: {
    position: "absolute",
    right: Spacing.xl,
    zIndex: 100,
  },
});
