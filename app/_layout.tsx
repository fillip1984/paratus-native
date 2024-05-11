import FontAwesome from "@expo/vector-icons/FontAwesome";
import NetInfo from "@react-native-community/netinfo";
import {
  QueryClient,
  QueryClientProvider,
  focusManager,
  onlineManager,
} from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { PermissionStatus } from "expo-modules-core";
import * as Notifications from "expo-notifications";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { AppState, AppStateStatus, Platform } from "react-native";

import { handleNotification } from "@/notifications";

import "../global.css";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  const [notificationsPermitted, setNotificationsPermitted] =
    useState<PermissionStatus>(PermissionStatus.UNDETERMINED);

  const requestNotificationPermission = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    setNotificationsPermitted(status);
  };

  // https://tanstack.com/query/latest/docs/framework/react/react-native#online-status-management
  onlineManager.setEventListener((setOnline) => {
    return NetInfo.addEventListener((state) => {
      setOnline(!!state.isConnected);
    });
  });

  // https://tanstack.com/query/latest/docs/framework/react/react-native#refetch-on-app-focus
  const onAppStateChange = (status: AppStateStatus) => {
    if (Platform.OS !== "web") {
      focusManager.setFocused(status === "active");
    }
  };

  useEffect(() => {
    const subscription = AppState.addEventListener("change", onAppStateChange);
    return () => subscription.remove();
  }, []);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
      requestNotificationPermission();
    }
  }, [loaded]);

  useEffect(() => {
    if (notificationsPermitted !== PermissionStatus.GRANTED) return;
    const listener =
      Notifications.addNotificationReceivedListener(handleNotification);
    return () => listener.remove();
  }, [notificationsPermitted]);

  const [queryClient] = useState(() => new QueryClient());

  if (!loaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <RootLayoutNav />
    </QueryClientProvider>
  );
}

function RootLayoutNav() {
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="(routines)/[id]"
          options={{ presentation: "modal" }}
        />
        <Stack.Screen
          name="(modals)/preferences"
          options={{ presentation: "modal" }}
        />
        <Stack.Screen
          name="(modals)/interactions/bloodPressure/[activityId]"
          options={{ presentation: "modal" }}
        />
        <Stack.Screen
          name="(modals)/interactions/runModal"
          options={{ presentation: "modal" }}
        />
        <Stack.Screen
          name="(modals)/interactions/weighInModal"
          options={{ presentation: "modal" }}
        />
        <Stack.Screen
          name="(modals)/interactions/noteModal"
          options={{ presentation: "modal" }}
        />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}
