import "../global.css";

import NetInfo from "@react-native-community/netinfo";
import { focusManager, onlineManager } from "@tanstack/react-query";
import * as LocalAuthentication from "expo-local-authentication";
import { PermissionStatus } from "expo-modules-core";
import * as Notifications from "expo-notifications";
import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import type { Dispatch, SetStateAction } from "react";
import { useEffect, useState } from "react";
import type { AppStateStatus } from "react-native";
import { AppState, Platform, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { runMigrations } from "@/db";
import { handleNotification } from "@/notifications";
import { useSignIn, useSignOut, useUser } from "@/utils/auth";

SplashScreen.preventAutoHideAsync();

const requestNotificationPermission = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  return status;
};

const requestAndAuthenticateViaBiometrics = async () => {
  const authenticated = await LocalAuthentication.authenticateAsync({
    promptMessage: "Authenticate with Face ID",
  });

  if (authenticated.success) {
    return true;
  } else {
    console.warn(authenticated.error);
    return false;
  }
};

export default function RootLayoutNav() {
  const [loaded, setLoaded] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [notificationsPermitted, setNotificationsPermitted] =
    useState<PermissionStatus>(PermissionStatus.UNDETERMINED);

  // effects to run on startup
  useEffect(() => {
    async function startup() {
      setLoaded(false);
      console.log("Performing effects on startup");
      await runMigrations();

      // request to send notifications
      const notificationPermStatus = await requestNotificationPermission();
      setNotificationsPermitted(notificationPermStatus);

      // request to use biometric hardware for authentication
      const biometricsResult = await requestAndAuthenticateViaBiometrics();
      setAuthenticated(biometricsResult);
      setLoaded(true);
      console.log("Performed effects on startup");
    }

    startup();
  }, []);

  // registers a notification handler for when notifications are triggered and the app is open
  useEffect(() => {
    if (notificationsPermitted !== PermissionStatus.GRANTED) return;
    const listener =
      Notifications.addNotificationReceivedListener(handleNotification);
    return () => listener.remove();
  }, [notificationsPermitted]);

  // causes trpc/Tanstack Query to refetch on route change
  // https://tanstack.com/query/latest/docs/framework/react/react-native#refetch-on-app-focus
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (status: AppStateStatus) => {
        if (Platform.OS !== "web") {
          focusManager.setFocused(status === "active");
        }
      },
    );
    return () => subscription.remove();
  }, []);

  // needed for trpc/Tanstack Query to know if the device is online (prevents calls if disconnected)
  // https://tanstack.com/query/latest/docs/framework/react/react-native#online-status-management
  useEffect(() => {
    onlineManager.setEventListener((setOnline) => {
      return NetInfo.addEventListener((state) => {
        setOnline(!!state.isConnected);
      });
    });

    // return () => not sure how to release here?!
  }, []);

  useEffect(() => {
    async function hideSplash() {
      console.log("we are loaded!");
      await SplashScreen.hideAsync();
    }
    if (loaded) {
      hideSplash();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (loaded) {
    return (
      <>
        {/* <TRPCProvider> */}
        {authenticated ? (
          <MainLayout />
        ) : (
          <MobileAuth setAuthenticated={setAuthenticated} />
        )}
        {/* </TRPCProvider> */}
        <StatusBar style="light" />
      </>
    );
  }
}

function MobileAuth({
  setAuthenticated,
}: {
  setAuthenticated: Dispatch<SetStateAction<boolean>>;
}) {
  const user = useUser();
  const signIn = useSignIn();
  const signOut = useSignOut();

  useEffect(() => {
    // if (user) {
    //   setAuthenticated(true);
    // }
  }, [user, setAuthenticated]);

  return (
    <SafeAreaView>
      <View className="flex h-full items-center justify-center">
        <Text className="pb-2 text-center text-xl font-semibold text-black">
          {/* {user?.name ?? "Not logged in"} */}
        </Text>
        {/* <Pressable
          onPress={() => (user ? signOut() : signIn())}
          className="rounded bg-blue-500 px-4 py-2">
          <Text className="text-xl text-white">
            {user ? "Sign Out" : "Sign In With provider"}
          </Text>
        </Pressable> */}
      </View>
    </SafeAreaView>
  );
}

const MainLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(todos)/[id]" options={{ presentation: "modal" }} />
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
  );
};
