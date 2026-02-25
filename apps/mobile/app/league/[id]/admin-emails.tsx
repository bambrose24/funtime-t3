import React, { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { WebView } from "react-native-webview";
import { Button } from "@/components/ui/button";
import { clientApi } from "@/lib/trpc/react";

const toDateLabel = (value?: string | null) => {
  if (!value) {
    return "Unknown date";
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "Unknown date";
  }
  return parsed.toLocaleString();
};

const toHtmlDocument = (htmlBody: string) => {
  return `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;padding:16px;color:#111;margin:0;} img{max-width:100%;height:auto;} pre{white-space:pre-wrap;word-break:break-word;} a{color:#0b63f6;}</style></head><body>${htmlBody}</body></html>`;
};

export default function LeagueAdminEmailsScreen() {
  const { id, memberId } = useLocalSearchParams<{
    id: string;
    memberId?: string;
  }>();
  const leagueIdNumber = Number(id);
  const memberIdNumber = Number(memberId);
  const [selectedEmailHtml, setSelectedEmailHtml] = useState<string | null>(
    null,
  );
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const { data: session, isLoading: sessionLoading } =
    clientApi.session.current.useQuery();
  const { data: isSuperAdmin, isLoading: superAdminLoading } =
    clientApi.generalAdmin.isSuperAdmin.useQuery();

  const viewerMember = useMemo(() => {
    return session?.dbUser?.leaguemembers.find(
      (member) => member.league_id === leagueIdNumber,
    );
  }, [leagueIdNumber, session?.dbUser?.leaguemembers]);
  const canManageLeague =
    viewerMember?.role === "admin" || Boolean(isSuperAdmin);

  const { data: membersData, isLoading: membersLoading } =
    clientApi.league.admin.members.useQuery(
      { leagueId: leagueIdNumber },
      { enabled: Number.isFinite(leagueIdNumber) && canManageLeague },
    );

  const { data: emailData, isLoading: emailsLoading } =
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

  const member = membersData?.members.find(
    (leagueMember) => leagueMember.membership_id === memberIdNumber,
  );
  const emails = emailData?.emails ?? [];

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
      >
        <View className="gap-4">
          <View className="gap-1">
            <Text className="text-app-fg-light dark:text-app-fg-dark text-2xl font-bold">
              Email Logs
            </Text>
            <Text className="text-sm text-gray-600 dark:text-gray-400">
              {member
                ? `Viewing email history for @${member.people.username}`
                : `Viewing email history for member #${memberIdNumber}`}
            </Text>
          </View>

          {emails.length === 0 ? (
            <View className="rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
              <Text className="text-sm text-gray-600 dark:text-gray-400">
                No email logs found for this member.
              </Text>
            </View>
          ) : (
            emails.map((email) => {
              const subject = email.resend_data?.subject ?? "No subject";
              const sentAt = toDateLabel(email.resend_data?.created_at);
              const htmlContent = email.resend_data?.html ?? null;

              return (
                <View
                  key={email.id}
                  className="rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800 gap-3"
                >
                  <View className="gap-1">
                    <Text className="text-app-fg-light dark:text-app-fg-dark text-base font-semibold">
                      {subject}
                    </Text>
                    <Text className="text-xs text-gray-600 dark:text-gray-400">
                      {sentAt}
                    </Text>
                  </View>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!htmlContent}
                    onPress={() => {
                      if (!htmlContent) {
                        return;
                      }
                      setSelectedEmailHtml(htmlContent);
                      setIsPreviewOpen(true);
                    }}
                  >
                    {htmlContent ? "Preview Email" : "No Preview Available"}
                  </Button>
                </View>
              );
            })
          )}

          <Button variant="outline" onPress={() => router.back()}>
            Back
          </Button>
        </View>
      </ScrollView>

      <Modal
        visible={isPreviewOpen}
        animationType="slide"
        onRequestClose={() => {
          setIsPreviewOpen(false);
          setSelectedEmailHtml(null);
        }}
      >
        <SafeAreaView className="bg-app-bg-light dark:bg-app-bg-dark flex-1">
          <View className="border-b border-gray-200 px-4 py-3 dark:border-zinc-800 flex-row items-center justify-between">
            <Text className="text-app-fg-light dark:text-app-fg-dark text-lg font-semibold">
              Email Preview
            </Text>
            <Pressable
              onPress={() => {
                setIsPreviewOpen(false);
                setSelectedEmailHtml(null);
              }}
            >
              <Text className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                Close
              </Text>
            </Pressable>
          </View>

          {selectedEmailHtml ? (
            <WebView
              originWhitelist={["*"]}
              source={{ html: toHtmlDocument(selectedEmailHtml) }}
              style={{ flex: 1, backgroundColor: "white" }}
            />
          ) : (
            <View className="flex-1 items-center justify-center px-6">
              <Text className="text-center text-base text-gray-600 dark:text-gray-400">
                No email content to preview.
              </Text>
            </View>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
