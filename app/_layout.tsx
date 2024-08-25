import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import NetInfo from "@react-native-community/netinfo";
import {
  QueryClient,
  QueryClientProvider,
  focusManager,
  onlineManager,
} from "@tanstack/react-query";
import { useFonts } from "expo-font";
import * as LocalAuthentication from "expo-local-authentication";
import { PermissionStatus } from "expo-modules-core";
import * as Notifications from "expo-notifications";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  AppState,
  AppStateStatus,
  Platform,
  Pressable,
  SafeAreaView,
  Text,
  View,
} from "react-native";

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
  // set font
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  // setup biometric/login
  const [authenticated, setAuthenticated] = useState(false);
  const authenticate = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    console.log({ hasHardware, isEnrolled });
    const authenticated = await LocalAuthentication.authenticateAsync({
      promptMessage: "Authenticate with Face ID",
    });

    if (authenticated.success) {
      console.log({ authenticated: authenticated.success });
      setAuthenticated(true);
    } else {
      console.log(authenticated.error);
      setAuthenticated(false);
    }
  };

  useEffect(() => {
    authenticate();
  }, []);

  // check if we have permission to send notifications
  const [notificationsPermitted, setNotificationsPermitted] =
    useState<PermissionStatus>(PermissionStatus.UNDETERMINED);

  const requestNotificationPermission = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    setNotificationsPermitted(status);
  };

  // needed for trpc/Tanstack Query to know if the device is online (prevents calls if disconnected)
  // https://tanstack.com/query/latest/docs/framework/react/react-native#online-status-management
  onlineManager.setEventListener((setOnline) => {
    return NetInfo.addEventListener((state) => {
      setOnline(!!state.isConnected);
    });
  });

  // causes trpc/Tanstack Query to refetch on route change
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

  // effects to run on loaded
  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
      requestNotificationPermission();
    }
  }, [loaded]);

  // registers a notification handler for when notifications are triggered and the app is open
  useEffect(() => {
    if (notificationsPermitted !== PermissionStatus.GRANTED) return;
    const listener =
      Notifications.addNotificationReceivedListener(handleNotification);
    return () => listener.remove();
  }, [notificationsPermitted]);

  // creates a trpc/Tanstack Query query client
  const [queryClient] = useState(() => new QueryClient());

  // what view to return if not yet loaded
  if (!loaded) {
    return null;
  }

  // view to return if loaded but not authenticated
  if (loaded && !authenticated) {
    return (
      <>
        <SafeAreaView className="bg-stone-800">
          <View className="flex h-full items-center justify-center gap-8 bg-stone-900 px-2">
            <Text className="text-3xl text-white">Sign in</Text>
            <Pressable onPress={authenticate}>
              <MaterialCommunityIcons
                name="face-recognition"
                size={48}
                color="white"
              />
            </Pressable>
          </View>
        </SafeAreaView>
        <StatusBar style="light" />
      </>
    );
  }

  // what view to return if loaded and authenticated
  if (loaded && authenticated) {
    return (
      <QueryClientProvider client={queryClient}>
        <RootLayoutNav />
      </QueryClientProvider>
    );
  }
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
          name="(modals)/interactions/weighIn/[activityId]"
          options={{ presentation: "modal" }}
        />
        <Stack.Screen
          name="(modals)/interactions/note/[activityId]"
          options={{ presentation: "modal" }}
        />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}
