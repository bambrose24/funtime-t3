import React, { useCallback, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { WebView } from "react-native-webview";
import { Button } from "@/components/ui/button";
import { clientApi } from "@/lib/trpc/react";
import { useColorScheme } from "@/lib/useColorScheme";
import {
  emailTypeLabels,
  getEmailDisplayStatus,
  isEmailFailure,
} from "@funtime/api/utils/emailStatus";

const toDateLabel = (value?: string | Date | null) => {
  if (!value) {
    return "Unknown date";
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "Unknown date";
  }
  return parsed.toLocaleString();
};

const toCompactDateLabel = (value?: string | Date | null) => {
  if (!value) {
    return "Unknown";
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "Unknown";
  }
  const month = parsed.getMonth() + 1;
  const day = parsed.getDate();
  const year = parsed.getFullYear() % 100;
  const hours24 = parsed.getHours();
  const minutes = parsed.getMinutes().toString().padStart(2, "0");
  const ampm = hours24 >= 12 ? "pm" : "am";
  const hours12 = hours24 % 12 || 12;
  const year2 = year.toString().padStart(2, "0");

  return `${month}/${day}/${year2} ${hours12}:${minutes}${ampm}`;
};

const toTimestamp = (value?: string | Date | null) => {
  if (!value) {
    return 0;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return 0;
  }
  return parsed.getTime();
};

const toHtmlDocument = (htmlBody: string) => {
  return `<!doctype html><html><head><meta charset="utf-8"/><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline';"/><meta name="viewport" content="width=device-width,initial-scale=1"/><style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;padding:16px;color:#111;margin:0;} pre{white-space:pre-wrap;word-break:break-word;}</style></head><body>${htmlBody}</body></html>`;
};

export default function LeagueAdminEmailsScreen() {
  const { isDarkColorScheme } = useColorScheme();
  const { id, memberId } = useLocalSearchParams<{
    id: string;
    memberId?: string;
  }>();
  const leagueIdNumber = Number(id);
  const memberIdNumber = Number(memberId);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    data: session,
    isLoading: sessionLoading,
    refetch: refetchSession,
  } = clientApi.session.current.useQuery();
  const {
    data: isSuperAdmin,
    isLoading: superAdminLoading,
    refetch: refetchSuperAdmin,
  } = clientApi.generalAdmin.isSuperAdmin.useQuery();

  const viewerMember = useMemo(() => {
    return session?.dbUser?.leaguemembers.find(
      (member) => member.league_id === leagueIdNumber,
    );
  }, [leagueIdNumber, session?.dbUser?.leaguemembers]);
  const canManageLeague =
    viewerMember?.role === "admin" || Boolean(isSuperAdmin);

  const {
    data: membersData,
    isLoading: membersLoading,
    refetch: refetchMembers,
  } = clientApi.league.admin.members.useQuery(
    { leagueId: leagueIdNumber },
    { enabled: Number.isFinite(leagueIdNumber) && canManageLeague },
  );

  const {
    data: emailData,
    isLoading: emailsLoading,
    isError: emailsError,
    refetch: refetchEmails,
  } = clientApi.league.admin.memberEmails.useQuery(
    {
      leagueId: leagueIdNumber,
      memberId: memberIdNumber,
      includeContent: false,
    },
    {
      enabled:
        Number.isFinite(leagueIdNumber) &&
        Number.isFinite(memberIdNumber) &&
        canManageLeague,
    },
  );

  const detail = clientApi.league.admin.memberEmail.useQuery(
    {
      leagueId: leagueIdNumber,
      memberId: memberIdNumber,
      emailLogId: selectedEmailId ?? "",
    },
    {
      enabled: isPreviewOpen && Boolean(selectedEmailId) && canManageLeague,
      staleTime: 60_000,
      retry: false,
    },
  );
  const selectedLog =
    detail.data ??
    emailData?.emails.find((email) => email.id === selectedEmailId);
  const selectedStatus = selectedLog
    ? getEmailDisplayStatus(selectedLog)
    : null;
  const selectedPreview = selectedLog
    ? {
        subject:
          selectedLog.resend_data?.subject ??
          emailTypeLabels[selectedLog.email_type] ??
          "League email",
        renderedHtml: detail.data?.preview_html
          ? toHtmlDocument(detail.data.preview_html)
          : null,
        sentAtLabel: toDateLabel(selectedLog.sent_at),
        resendId: selectedLog.resend_id,
      }
    : null;

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    Haptics.selectionAsync().catch(() => {
      // No-op if haptics are unavailable.
    });

    try {
      await refetchSession();
      await refetchSuperAdmin();
      if (canManageLeague) {
        await Promise.all([refetchMembers(), refetchEmails()]);
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [
    canManageLeague,
    refetchEmails,
    refetchMembers,
    refetchSession,
    refetchSuperAdmin,
  ]);

  const member = membersData?.members.find(
    (leagueMember) => leagueMember.membership_id === memberIdNumber,
  );
  const emails = emailData?.emails ?? [];
  const sortedEmails = useMemo(() => {
    return [...emails].sort((a, b) => {
      const aTime = toTimestamp(a.resend_data?.created_at ?? a.sent_at);
      const bTime = toTimestamp(b.resend_data?.created_at ?? b.sent_at);
      return bTime - aTime;
    });
  }, [emails]);

  if (
    !id ||
    Number.isNaN(leagueIdNumber) ||
    !memberId ||
    Number.isNaN(memberIdNumber)
  ) {
    return (
      <SafeAreaView className="flex-1 bg-app-bg-light dark:bg-app-bg-dark">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-base text-gray-500 dark:text-gray-400">
            Member context is missing.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (
    sessionLoading ||
    superAdminLoading ||
    (canManageLeague && (membersLoading || emailsLoading))
  ) {
    return (
      <SafeAreaView className="flex-1 bg-app-bg-light dark:bg-app-bg-dark">
        <View className="flex-1 items-center justify-center">
          <Text className="text-base text-gray-500 dark:text-gray-400">
            Loading email logs...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!canManageLeague) {
    return (
      <SafeAreaView className="flex-1 bg-app-bg-light dark:bg-app-bg-dark">
        <View className="flex-1 items-center justify-center gap-3 px-6">
          <Text className="text-center text-2xl font-bold text-app-fg-light dark:text-app-fg-dark">
            Admin Access Required
          </Text>
          <Text className="text-center text-base text-gray-600 dark:text-gray-400">
            You need league admin or super-admin permissions to view email logs.
          </Text>
          <Button onPress={() => router.back()}>Back</Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-app-bg-light dark:bg-app-bg-dark">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        <View className="gap-4">
          <View className="flex-row items-start gap-3 px-1">
            <Pressable
              onPress={() => router.back()}
              className="bg-app-card-light dark:bg-app-card-dark mt-1 rounded-lg p-2"
            >
              <Ionicons
                name="chevron-back"
                size={22}
                color={isDarkColorScheme ? "#e5e7eb" : "#374151"}
              />
            </Pressable>
            <View className="flex-1 gap-1">
              <Text className="text-2xl font-bold text-app-fg-light dark:text-app-fg-dark">
                Email Logs
              </Text>
              <Text className="text-sm text-gray-600 dark:text-gray-400">
                {member
                  ? `Viewing email history for @${member.people.username}`
                  : `Viewing email history for member #${memberIdNumber}`}
              </Text>
            </View>
          </View>

          {emailsError ? (
            <Text
              accessibilityRole="alert"
              className="text-sm text-red-600 dark:text-red-400"
            >
              Couldn’t load email activity. Pull down to try again.
            </Text>
          ) : sortedEmails.length === 0 ? (
            <View className="rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
              <Text className="text-sm text-gray-600 dark:text-gray-400">
                No email logs found for this member.
              </Text>
            </View>
          ) : (
            <View className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
              <View className="flex-row items-center border-b border-gray-200 bg-gray-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900">
                <Text className="w-24 text-[11px] font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                  Sent
                </Text>
                <Text className="flex-1 text-[11px] font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                  Email
                </Text>
                <Text className="w-20 text-right text-[11px] font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                  Details
                </Text>
              </View>
              {sortedEmails.map((email, index) => {
                const current =
                  email.id === selectedEmailId && detail.data
                    ? detail.data
                    : email;
                const status = getEmailDisplayStatus(current);
                const subject =
                  current.resend_data?.subject ??
                  `${emailTypeLabels[email.email_type] ?? "League email"}${email.week != null ? ` · Week ${email.week}` : ""}`;
                const compactSentAt = toCompactDateLabel(
                  email.resend_data?.created_at ?? email.sent_at,
                );

                return (
                  <View
                    key={email.id}
                    className={`flex-row items-center px-3 py-2 ${
                      index < sortedEmails.length - 1
                        ? "border-b border-gray-100 dark:border-zinc-800"
                        : ""
                    }`}
                  >
                    <Text
                      numberOfLines={1}
                      className="w-24 text-xs text-gray-600 dark:text-gray-400"
                    >
                      {compactSentAt}
                    </Text>
                    <View className="flex-1 gap-1 pr-2">
                      <Text className="text-sm text-app-fg-light dark:text-app-fg-dark">
                        {subject}
                      </Text>
                      <Text
                        className={
                          isEmailFailure(status.delivery)
                            ? "text-xs font-semibold text-red-600 dark:text-red-400"
                            : "text-xs font-semibold text-app-fg-light dark:text-app-fg-dark"
                        }
                      >
                        {status.label}
                      </Text>
                      <Text className="text-xs text-gray-500 dark:text-gray-400">
                        {status.opened ? "Opened" : "No open recorded"} ·{" "}
                        {status.clicked ? "Clicked" : "No click recorded"}
                      </Text>
                      {current.failure_reason && (
                        <Text className="text-xs text-red-600 dark:text-red-400">
                          {current.failure_reason}
                        </Text>
                      )}
                    </View>
                    <Pressable
                      className="w-20 items-end"
                      onPress={() => {
                        setSelectedEmailId(email.id);
                        setIsPreviewOpen(true);
                      }}
                    >
                      <Text className="py-3 text-xs font-semibold text-blue-600 dark:text-blue-400">
                        Open
                      </Text>
                    </Pressable>
                  </View>
                );
              })}
            </View>
          )}
          <Text className="px-1 text-xs text-gray-500 dark:text-gray-400">
            No recorded activity doesn’t mean an email wasn’t read. Tracking may
            be disabled or blocked; automated activity can register opens or
            clicks.
          </Text>
        </View>
      </ScrollView>

      <Modal
        visible={isPreviewOpen}
        animationType="slide"
        onRequestClose={() => {
          setIsPreviewOpen(false);
          setSelectedEmailId(null);
        }}
      >
        <SafeAreaView className="flex-1 bg-app-bg-light dark:bg-app-bg-dark">
          <View className="flex-row items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-zinc-800">
            <Text
              numberOfLines={1}
              className="flex-1 pr-2 text-lg font-semibold text-app-fg-light dark:text-app-fg-dark"
            >
              {selectedPreview?.subject ?? "Email Preview"}
            </Text>
            <Pressable
              onPress={() => {
                setIsPreviewOpen(false);
                setSelectedEmailId(null);
              }}
            >
              <Text className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                Close
              </Text>
            </Pressable>
          </View>

          <View className="gap-2 border-b border-gray-200 px-4 py-3 dark:border-zinc-800">
            {selectedStatus && (
              <Text className="text-sm text-app-fg-light dark:text-app-fg-dark">
                {selectedStatus.label} ·{" "}
                {selectedStatus.opened ? "Opened" : "No open recorded"} ·{" "}
                {selectedStatus.clicked ? "Clicked" : "No click recorded"}
              </Text>
            )}
            {selectedLog?.last_opened_at && (
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                Last open: {toDateLabel(selectedLog.last_opened_at)} ·{" "}
                {selectedLog.open_count} recorded
              </Text>
            )}
            {selectedLog?.last_clicked_at && (
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                Last click: {toDateLabel(selectedLog.last_clicked_at)} ·{" "}
                {selectedLog.click_count} recorded
              </Text>
            )}
            {selectedLog?.failure_reason && (
              <Text className="text-sm text-red-600 dark:text-red-400">
                {selectedLog.failure_reason}
              </Text>
            )}
            {(detail.isError ||
              (detail.data && !detail.data.provider_available)) && (
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                Resend is unavailable. Stored activity is still shown.
              </Text>
            )}
            <Button
              variant="outline"
              disabled={detail.isFetching}
              onPress={() => void detail.refetch()}
            >
              {detail.isFetching ? "Checking Resend…" : "Refresh from Resend"}
            </Button>
          </View>
          {detail.isLoading ? (
            <Text className="p-4 text-gray-500">Loading email details…</Text>
          ) : selectedPreview?.renderedHtml ? (
            <WebView
              originWhitelist={["*"]}
              source={{ html: selectedPreview.renderedHtml }}
              javaScriptEnabled={false}
              onShouldStartLoadWithRequest={(request) =>
                request.url === "about:blank" ||
                request.url.startsWith("data:text/html")
              }
              style={{ flex: 1, backgroundColor: "white" }}
            />
          ) : (
            <View className="flex-1 items-center justify-center px-6">
              <Text className="text-center text-base font-semibold text-app-fg-light dark:text-app-fg-dark">
                Preview unavailable
              </Text>
              <Text className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                Resend did not return an HTML or text body for this email log.
              </Text>
              <Text className="mt-2 text-center text-xs text-gray-500 dark:text-gray-500">
                {selectedPreview
                  ? `${selectedPreview.sentAtLabel} · ID ${selectedPreview.resendId}`
                  : ""}
              </Text>
            </View>
          )}

          {selectedPreview?.renderedHtml ? (
            <View className="border-t border-gray-200 px-4 py-2 dark:border-zinc-800">
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                Images and links are disabled so this preview won’t count as an
                open or click.
              </Text>
            </View>
          ) : null}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
