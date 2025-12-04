import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import MessagesScreen from "@/screens/MessagesScreen";
import { useTheme } from "@/hooks/useTheme";
import { getCommonScreenOptions } from "@/navigation/screenOptions";
import { MessagesStackParamList } from "@/navigation/types";

const Stack = createNativeStackNavigator<MessagesStackParamList>();

export default function MessagesStackNavigator() {
  const { theme, isDark } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        ...getCommonScreenOptions({ theme, isDark }),
      }}
    >
      <Stack.Screen
        name="Messages"
        component={MessagesScreen}
        options={{
          title: "Messages",
        }}
      />
    </Stack.Navigator>
  );
}
