"use client";

import { usePathname, useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import { PostHogProvider, usePostHog } from "posthog-js/react";
import { useEffect } from "react";
import { clientApi } from "~/trpc/react";
import { type RouterOutputs } from "~/trpc/types";

if (typeof window !== "undefined") {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY ?? "", {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "",
    person_profiles: "identified_only",
    capture_pageview: false, // Disable automatic pageview capture, as we capture manually
    session_recording: {
      maskAllInputs: false,
      maskInputOptions: {
        password: true,
        email: false,
      },
    },
  });
}

type Props = {
  data: RouterOutputs["session"]["current"];
  children: React.ReactNode;
};

export function UserProviderClient({ children, data: initialData }: Props) {
  const { data: user } = clientApi.session.current.useQuery(undefined, {
    initialData,
  });
  useEffect(() => {
    if (user.dbUser) {
      posthog.identify(user.dbUser.email, {
        userId: user.dbUser.uid,
        username: user.dbUser.username,
        email: user.dbUser.email,
      });
    }
  }, [user.dbUser]);
  return (
    <PostHogProvider client={posthog}>
      {children}
      <PostHogPageView />
    </PostHogProvider>
  );
}

export default function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const posthogClient = usePostHog();
  useEffect(() => {
    // Track pageviews
    if (pathname && posthogClient) {
      let url = window.origin + pathname;
      if (searchParams.toString()) {
        url = url + `?${searchParams.toString()}`;
      }
      posthogClient.capture("$pageview", {
        $current_url: url,
      });
    }
  }, [pathname, searchParams, posthogClient]);

  return null;
}
