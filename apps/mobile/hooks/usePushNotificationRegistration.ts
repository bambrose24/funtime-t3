import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { clientApi } from "@/lib/trpc/react";

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
  const { data: appSession } = clientApi.session.current.useQuery(undefined, {
    enabled: hasSession,
    refetchOnWindowFocus: false,
  });
  const { mutateAsync: registerPushToken } =
    clientApi.settings.registerPushToken.useMutation();

  useEffect(() => {
    const navigateFromNotification = (
      response: Notifications.NotificationResponse | null,
    ) => {
      const path = response?.notification.request.content.data?.path;
      if (typeof path === "string" && path.length > 0) {
        router.push(path as any);
      }
    };

    Notifications.getLastNotificationResponseAsync()
      .then((response) => {
        navigateFromNotification(response);
      })
      .catch((error) => {
        console.error("Failed reading last notification response", error);
      });

    const subscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        navigateFromNotification(response);
      });
    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
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
        Constants.easConfig?.projectId ??
        Constants.expoConfig?.extra?.eas?.projectId;

      const tokenResult = await Notifications.getExpoPushTokenAsync(
        projectId ? { projectId } : undefined,
      );

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
