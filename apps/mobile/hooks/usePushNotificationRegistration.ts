import { useEffect, useRef } from "react";
import * as Linking from "expo-linking";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { clientApi } from "@/lib/trpc/react";
import { isE2EMode } from "@/lib/e2e";
import {
  clearPendingPushTokenRevocation,
  flushPendingPushTokenRevocations,
} from "@/lib/auth/pendingPushTokenRevocation";
import { resolveAppDestination } from "@/lib/deeplink/resolveDeepLink";
import { registerDevicePushToken } from "@/lib/notifications/registerDevicePushToken";

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
  const pendingRevokeFlushForUserRef = useRef<number | null>(null);
  const lastHandledNotificationResponseIdRef = useRef<string | null>(null);
  const { data: appSession } = clientApi.session.current.useQuery(undefined, {
    enabled: hasSession,
    refetchOnWindowFocus: false,
  });
  const { mutateAsync: registerPushToken } =
    clientApi.settings.registerPushToken.useMutation();
  const { mutateAsync: unregisterPushToken } =
    clientApi.settings.unregisterPushToken.useMutation();

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
        const target = resolveAppDestination(path);
        if (!target) {
          console.warn(
            "[Push] Ignoring notification destination outside the allowlist",
            { path },
          );
          lastHandledNotificationResponseIdRef.current = responseId;
        } else {
          lastHandledNotificationResponseIdRef.current = responseId;
          if (target.openInBrowser) {
            void Linking.openURL(target.href);
          } else if (target.mode === "replace") {
            router.replace(target.href as any);
          } else {
            router.push(target.href as any);
          }
        }
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

  // Retry push-token revocations that failed or were deferred during a prior
  // sign-out for this same app user.
  useEffect(() => {
    if (isE2EMode) {
      return;
    }

    const dbUser = appSession?.dbUser;
    if (!hasSession || !dbUser) {
      pendingRevokeFlushForUserRef.current = null;
      return;
    }

    if (pendingRevokeFlushForUserRef.current === dbUser.uid) {
      return;
    }
    pendingRevokeFlushForUserRef.current = dbUser.uid;

    void flushPendingPushTokenRevocations({
      uid: dbUser.uid,
      unregisterPushToken,
    }).catch((error) => {
      console.warn("[Push] Failed flushing pending token revocations", error);
    });
  }, [appSession?.dbUser, hasSession, unregisterPushToken]);

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

    // Never prompt on cold launch. Only refresh an already-granted token so
    // the OS permission dialog stays tied to an intentional Account action.
    registerDevicePushToken({
      registerPushToken,
      requestPermissionIfNeeded: false,
      isE2EMode,
    })
      .then(async (result) => {
        if (result.status === "registered") {
          await clearPendingPushTokenRevocation(result.token, dbUser.uid);
        }
      })
      .catch((error) => {
        console.error("Failed to register push notification token", error);
      });
  }, [appSession?.dbUser, hasSession, registerPushToken]);
}
