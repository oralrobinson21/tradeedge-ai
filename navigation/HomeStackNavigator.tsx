import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import CustomerHomeScreen from "@/screens/CustomerHomeScreen";
import WorkerHomeScreen from "@/screens/WorkerHomeScreen";
import { HeaderTitle } from "@/components/HeaderTitle";
import { useTheme } from "@/hooks/useTheme";
import { useApp } from "@/context/AppContext";
import { getCommonScreenOptions } from "@/navigation/screenOptions";
import { HomeStackParamList } from "@/navigation/types";

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStackNavigator() {
  const { theme, isDark } = useTheme();
  const { user } = useApp();
  
  const isWorker = user?.role === "worker";
  const HomeScreen = isWorker ? WorkerHomeScreen : CustomerHomeScreen;

  return (
    <Stack.Navigator
      screenOptions={{
        ...getCommonScreenOptions({ theme, isDark }),
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerTitle: () => <HeaderTitle title="CityTasks" />,
        }}
      />
    </Stack.Navigator>
  );
}
