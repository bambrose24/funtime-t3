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

const escapeHtml = (input: string) => {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
};

const toHtmlDocument = (htmlBody: string) => {
  return `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;padding:16px;color:#111;margin:0;} img{max-width:100%;height:auto;} pre{white-space:pre-wrap;word-break:break-word;} a{color:#0b63f6;}</style></head><body>${htmlBody}</body></html>`;
};

type SelectedPreview = {
  subject: string;
  renderedHtml: string | null;
  source: "html" | "text" | null;
  sentAtLabel: string;
  resendId: string;
};

export default function LeagueAdminEmailsScreen() {
  const { isDarkColorScheme } = useColorScheme();
  const { id, memberId } = useLocalSearchParams<{
    id: string;
    memberId?: string;
  }>();
  const leagueIdNumber = Number(id);
  const memberIdNumber = Number(memberId);
  const [selectedPreview, setSelectedPreview] = useState<SelectedPreview | null>(
    null,
  );
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: session, isLoading: sessionLoading, refetch: refetchSession } =
    clientApi.session.current.useQuery();
  const {
    data: isSuperAdmin,
    isLoading: superAdminLoading,
    refetch: refetchSuperAdmin,
  } =
    clientApi.generalAdmin.isSuperAdmin.useQuery();

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
  } =
    clientApi.league.admin.members.useQuery(
      { leagueId: leagueIdNumber },
      { enabled: Number.isFinite(leagueIdNumber) && canManageLeague },
    );

  const { data: emailData, isLoading: emailsLoading, refetch: refetchEmails } =
    clientApi.league.admin.memberEmails.useQuery(
      {
        leagueId: leagueIdNumber,
        memberId: memberIdNumber,
      },
      {
        enabled:
          Number.isFinite(leagueIdNumber) &&
          Number.isFinite(memberIdNumber) &&
          canManageLeague,
      },
    );

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
      <SafeAreaView className="bg-app-bg-light dark:bg-app-bg-dark flex-1">
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
      <SafeAreaView className="bg-app-bg-light dark:bg-app-bg-dark flex-1">
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
      <SafeAreaView className="bg-app-bg-light dark:bg-app-bg-dark flex-1">
        <View className="flex-1 items-center justify-center px-6 gap-3">
          <Text className="text-app-fg-light dark:text-app-fg-dark text-center text-2xl font-bold">
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
    <SafeAreaView className="bg-app-bg-light dark:bg-app-bg-dark flex-1">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
          />
        }
      >
        <View className="gap-4">
          <View className="flex-row items-start gap-3 px-1">
            <Pressable
              onPress={() => router.back()}
              className="mt-1 rounded-lg bg-app-card-light p-2 dark:bg-app-card-dark"
            >
              <Ionicons
                name="chevron-back"
                size={22}
                color={isDarkColorScheme ? "#e5e7eb" : "#374151"}
              />
            </Pressable>
            <View className="flex-1 gap-1">
              <Text className="text-app-fg-light dark:text-app-fg-dark text-2xl font-bold">
                Email Logs
              </Text>
              <Text className="text-sm text-gray-600 dark:text-gray-400">
                {member
                  ? `Viewing email history for @${member.people.username}`
                  : `Viewing email history for member #${memberIdNumber}`}
              </Text>
            </View>
          </View>

          {sortedEmails.length === 0 ? (
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
                  Subject
                </Text>
                <Text className="w-20 text-right text-[11px] font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                  Preview
                </Text>
              </View>
              {sortedEmails.map((email, index) => {
                const subject = email.resend_data?.subject ?? "No subject";
                const sentAt = toDateLabel(
                  email.resend_data?.created_at ?? email.sent_at,
                );
                const compactSentAt = toCompactDateLabel(
                  email.resend_data?.created_at ?? email.sent_at,
                );
                const htmlContent =
                  email.resend_data?.html?.trim().length
                    ? email.resend_data.html
                    : null;
                const textContent =
                  email.resend_data?.text?.trim().length
                    ? email.resend_data.text
                    : null;
                const previewSource = htmlContent
                  ? "html"
                  : textContent
                    ? "text"
                    : null;
                const renderedHtml = htmlContent
                  ? toHtmlDocument(htmlContent)
                  : textContent
                    ? toHtmlDocument(`<pre>${escapeHtml(textContent)}</pre>`)
                    : null;
                const previewAvailable = Boolean(previewSource);

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
                    <Text
                      numberOfLines={1}
                      className="flex-1 pr-2 text-sm text-app-fg-light dark:text-app-fg-dark"
                    >
                      {subject}
                    </Text>
                    <Pressable
                      className="w-20 items-end"
                      onPress={() => {
                        setSelectedPreview({
                          subject,
                          renderedHtml,
                          source: previewSource,
                          sentAtLabel: sentAt,
                          resendId: email.resend_id,
                        });
                        setIsPreviewOpen(true);
                      }}
                    >
                      <Text
                        className={`text-xs font-semibold ${
                          previewAvailable
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-400 dark:text-gray-500"
                        }`}
                      >
                        {previewAvailable ? "Open" : "Unavailable"}
                      </Text>
                    </Pressable>
                  </View>
                );
              })}
            </View>
          )}
          <Text className="px-1 text-xs text-gray-500 dark:text-gray-400">
            Preview is shown when Resend returns an HTML or text body for the
            selected email.
          </Text>
        </View>
      </ScrollView>

      <Modal
        visible={isPreviewOpen}
        animationType="slide"
        onRequestClose={() => {
          setIsPreviewOpen(false);
          setSelectedPreview(null);
        }}
      >
        <SafeAreaView className="bg-app-bg-light dark:bg-app-bg-dark flex-1">
          <View className="border-b border-gray-200 px-4 py-3 dark:border-zinc-800 flex-row items-center justify-between">
            <Text
              numberOfLines={1}
              className="text-app-fg-light dark:text-app-fg-dark text-lg font-semibold flex-1 pr-2"
            >
              {selectedPreview?.subject ?? "Email Preview"}
            </Text>
            <Pressable
              onPress={() => {
                setIsPreviewOpen(false);
                setSelectedPreview(null);
              }}
            >
              <Text className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                Close
              </Text>
            </Pressable>
          </View>

          {selectedPreview?.renderedHtml ? (
            <WebView
              originWhitelist={["*"]}
              source={{ html: selectedPreview.renderedHtml }}
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

          {selectedPreview?.source ? (
            <View className="border-t border-gray-200 px-4 py-2 dark:border-zinc-800">
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                Showing {selectedPreview.source.toUpperCase()} preview
              </Text>
            </View>
          ) : null}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
