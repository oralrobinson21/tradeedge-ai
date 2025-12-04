import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import MainTabNavigator from "@/navigation/MainTabNavigator";
import OnboardingScreen from "@/screens/OnboardingScreen";
import LoginScreen from "@/screens/LoginScreen";
import VerifyScreen from "@/screens/VerifyScreen";
import CreateTaskScreen from "@/screens/CreateTaskScreen";
import TaskDetailScreen from "@/screens/TaskDetailScreen";
import ChatScreen from "@/screens/ChatScreen";
import PaymentScreen from "@/screens/PaymentScreen";
import CompletionPhotoScreen from "@/screens/CompletionPhotoScreen";
import ApprovalScreen from "@/screens/ApprovalScreen";
import RatingScreen from "@/screens/RatingScreen";
import HelpScreen from "@/screens/HelpScreen";
import ApplicantsScreen from "@/screens/ApplicantsScreen";
import VerifyPhoneScreen from "@/screens/VerifyPhoneScreen";
import SupportScreen from "@/screens/SupportScreen";
import { useTheme } from "@/hooks/useTheme";
import { useApp } from "@/context/AppContext";
import { getCommonScreenOptions } from "@/navigation/screenOptions";
import { RootStackParamList } from "@/navigation/types";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { theme, isDark } = useTheme();
  const { user, isLoading } = useApp();

  if (isLoading) {
    return null;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        ...getCommonScreenOptions({ theme, isDark, transparent: false }),
        headerShown: false,
      }}
    >
      {user ? (
        <>
          <Stack.Screen name="Main" component={MainTabNavigator} />
          <Stack.Screen
            name="CreateTask"
            component={CreateTaskScreen}
            options={{
              presentation: "modal",
              animation: "slide_from_bottom",
            }}
          />
          <Stack.Screen
            name="TaskDetail"
            component={TaskDetailScreen}
            options={{
              animation: "slide_from_right",
            }}
          />
          <Stack.Screen
            name="Chat"
            component={ChatScreen}
            options={{
              animation: "slide_from_right",
            }}
          />
          <Stack.Screen
            name="Payment"
            component={PaymentScreen}
            options={{
              presentation: "modal",
              animation: "slide_from_bottom",
            }}
          />
          <Stack.Screen
            name="CompletionPhoto"
            component={CompletionPhotoScreen}
            options={{
              animation: "slide_from_right",
            }}
          />
          <Stack.Screen
            name="Approval"
            component={ApprovalScreen}
            options={{
              animation: "slide_from_right",
            }}
          />
          <Stack.Screen
            name="Rating"
            component={RatingScreen}
            options={{
              animation: "slide_from_right",
            }}
          />
          <Stack.Screen
            name="Help"
            component={HelpScreen}
            options={{
              presentation: "modal",
              animation: "slide_from_bottom",
            }}
          />
          <Stack.Screen
            name="Applicants"
            component={ApplicantsScreen}
            options={{
              animation: "slide_from_right",
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="VerifyPhone"
            component={VerifyPhoneScreen}
            options={{
              animation: "slide_from_right",
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="Support"
            component={SupportScreen}
            options={{
              animation: "slide_from_right",
              headerShown: false,
            }}
          />
        </>
      ) : (
        <>
          <Stack.Screen
            name="Onboarding"
            component={OnboardingScreen}
            options={{
              animation: "fade",
            }}
          />
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{
              animation: "slide_from_right",
            }}
          />
          <Stack.Screen
            name="Verify"
            component={VerifyScreen}
            options={{
              animation: "slide_from_right",
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
