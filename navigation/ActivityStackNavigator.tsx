import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ActivityScreen from "@/screens/ActivityScreen";
import { useTheme } from "@/hooks/useTheme";
import { useApp } from "@/context/AppContext";
import { getCommonScreenOptions } from "@/navigation/screenOptions";
import { ActivityStackParamList } from "@/navigation/types";

const Stack = createNativeStackNavigator<ActivityStackParamList>();

export default function ActivityStackNavigator() {
  const { theme, isDark } = useTheme();
  const { user } = useApp();
  
  const isWorker = user?.role === "worker";

  return (
    <Stack.Navigator
      screenOptions={{
        ...getCommonScreenOptions({ theme, isDark }),
      }}
    >
      <Stack.Screen
        name="Activity"
        component={ActivityScreen}
        options={{
          title: isWorker ? "My Jobs" : "Activity",
        }}
      />
    </Stack.Navigator>
  );
}
