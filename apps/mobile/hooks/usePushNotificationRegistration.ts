import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { clientApi } from "@/lib/trpc/react";
import { isE2EMode } from "@/lib/e2e";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function usePushNotificationRegistration(hasSession: boolean) {
  const registrationAttemptedForUserRef = useRef<number | null>(null);
  const lastHandledNotificationResponseIdRef = useRef<string | null>(null);
  const { data: appSession } = clientApi.session.current.useQuery(undefined, {
    enabled: hasSession,
    refetchOnWindowFocus: false,
  });
  const { mutateAsync: registerPushToken } =
    clientApi.settings.registerPushToken.useMutation();

  useEffect(() => {
    if (isE2EMode) {
      return;
    }

    const navigateFromNotification = async (
      response: Notifications.NotificationResponse | null,
    ) => {
      if (!response) {
        return;
      }

      const responseId = response.notification.request.identifier;
      if (
        responseId &&
        lastHandledNotificationResponseIdRef.current === responseId
      ) {
        return;
      }

      const path = response?.notification.request.content.data?.path;
      if (typeof path === "string" && path.length > 0) {
        lastHandledNotificationResponseIdRef.current = responseId;
        router.push(path as any);
      }

      try {
        await Notifications.clearLastNotificationResponseAsync();
      } catch (error) {
        console.warn("Failed clearing last notification response", error);
      }
    };

    Notifications.getLastNotificationResponseAsync()
      .then((response) => {
        void navigateFromNotification(response);
      })
      .catch((error) => {
        console.error("Failed reading last notification response", error);
      });

    const subscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        void navigateFromNotification(response);
      });
    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (isE2EMode) {
      return;
    }

    const dbUser = appSession?.dbUser;
    if (!hasSession || !dbUser) {
      registrationAttemptedForUserRef.current = null;
      return;
    }

    if (registrationAttemptedForUserRef.current === dbUser.uid) {
      return;
    }
    registrationAttemptedForUserRef.current = dbUser.uid;

    const registerToken = async () => {
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "Default",
          importance: Notifications.AndroidImportance.DEFAULT,
        });
      }

      let { status } = await Notifications.getPermissionsAsync();
      if (status !== "granted") {
        const permission = await Notifications.requestPermissionsAsync();
        status = permission.status;
      }
      if (status !== "granted") {
        return;
      }

      const projectId =
        process.env.EXPO_PUBLIC_EAS_PROJECT_ID ??
        Constants.easConfig?.projectId ??
        Constants.expoConfig?.extra?.eas?.projectId;

      if (!projectId) {
        console.warn(
          "[Push] Skipping Expo push token registration because no EAS projectId is configured. Set EXPO_PUBLIC_EAS_PROJECT_ID or expose expo.extra.eas.projectId.",
        );
        return;
      }

      const tokenResult = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      const platform: "ios" | "android" | "web" =
        Platform.OS === "ios" || Platform.OS === "android"
          ? Platform.OS
          : "web";

      await registerPushToken({
        token: tokenResult.data,
        platform,
      });
    };

    registerToken().catch((error) => {
      console.error("Failed to register push notification token", error);
    });
  }, [appSession?.dbUser, hasSession, registerPushToken]);
}
