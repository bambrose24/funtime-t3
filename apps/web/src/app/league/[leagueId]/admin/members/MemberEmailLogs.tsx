"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import {
  emailStatusLabels,
  emailTypeLabels,
  getEmailDisplayStatus,
  isEmailFailure,
} from "@funtime/api/utils/emailStatus";
import { clientApi } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { ScrollArea } from "~/components/ui/scroll-area";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@funtime/api";
type RouterOutputs = inferRouterOutputs<AppRouter>;

type Props = { memberId: number; leagueId: number };
type Email = RouterOutputs["league"]["admin"]["memberEmails"]["emails"][number];
const dateLabel = (value: Date | string | null) =>
  value ? format(new Date(value), "MMM d, yyyy · h:mm a") : "No date recorded";

function EmailRow({
  email,
  memberId,
  leagueId,
  listUpdatedAt,
}: Props & { email: Email; listUpdatedAt: number }) {
  const [expanded, setExpanded] = useState(false);
  const detail = clientApi.league.admin.memberEmail.useQuery(
    { leagueId, memberId, emailLogId: email.id },
    {
      enabled: expanded,
      staleTime: 60_000,
      retry: false,
      refetchOnWindowFocus: false,
    },
  );
  const current =
    detail.data && detail.dataUpdatedAt >= listUpdatedAt ? detail.data : email;
  const status = getEmailDisplayStatus(current);
  const title =
    current.resend_data?.subject ??
    emailTypeLabels[email.email_type] ??
    "League email";
  const detailId = `email-detail-${email.id}`;

  return (
    <li className="space-y-3 py-4 first:pt-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="break-words text-sm font-medium">
            {title}
            {!current.resend_data?.subject && email.week != null
              ? ` · Week ${email.week}`
              : ""}
          </p>
          <p className="text-xs text-muted-foreground">
            {dateLabel(email.sent_at)}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="min-h-11 shrink-0"
          aria-expanded={expanded}
          aria-controls={detailId}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "Close" : "Details"}
          {expanded ? (
            <ChevronUp className="ml-1 h-4 w-4" />
          ) : (
            <ChevronDown className="ml-1 h-4 w-4" />
          )}
        </Button>
      </div>
      <div
        className="flex flex-wrap items-center gap-2"
        aria-label="Email status"
      >
        <Badge
          variant={
            isEmailFailure(status.delivery)
              ? "destructive"
              : status.delivery === "delivered"
                ? "default"
                : "secondary"
          }
        >
          {status.label}
        </Badge>
        {status.opened ? (
          <Badge variant="outline">
            Opened{current.open_count ? ` · ${current.open_count}` : ""}
          </Badge>
        ) : (
          <span className="text-xs text-muted-foreground">
            No open recorded
          </span>
        )}
        {status.clicked ? (
          <Badge variant="outline">
            Clicked{current.click_count ? ` · ${current.click_count}` : ""}
          </Badge>
        ) : (
          <span className="text-xs text-muted-foreground">
            No click recorded
          </span>
        )}
      </div>
      {current.failure_reason && (
        <p className="break-words text-sm text-destructive">
          {current.failure_reason}
        </p>
      )}
      {expanded && (
        <div id={detailId} className="space-y-3 border-t pt-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              {detail.data?.provider_available
                ? `Latest from Resend: ${emailStatusLabels[detail.data.resend_data!.last_event] ?? detail.data.resend_data!.last_event}`
                : "Stored email activity"}
            </p>
            <Button
              variant="outline"
              size="sm"
              disabled={detail.isFetching}
              onClick={() => void detail.refetch()}
            >
              <RefreshCw
                className={`mr-2 h-3 w-3 ${detail.isFetching ? "animate-spin motion-reduce:animate-none" : ""}`}
              />
              {detail.isFetching ? "Checking…" : "Refresh from Resend"}
            </Button>
          </div>
          {detail.isLoading && (
            <p role="status" className="text-sm text-muted-foreground">
              Checking Resend…
            </p>
          )}
          {(detail.isError ||
            (detail.data && !detail.data.provider_available)) && (
            <p role="status" className="text-sm text-muted-foreground">
              Resend is unavailable for this email. Stored activity is still
              shown; try refreshing later.
            </p>
          )}
          <dl className="grid gap-2 text-xs sm:grid-cols-2">
            {current.delivered_at && (
              <div>
                <dt className="text-muted-foreground">Delivered</dt>
                <dd>{dateLabel(current.delivered_at)}</dd>
              </div>
            )}
            {current.failed_at && (
              <div>
                <dt className="text-muted-foreground">Delivery issue</dt>
                <dd>{dateLabel(current.failed_at)}</dd>
              </div>
            )}
            {current.last_opened_at && (
              <div>
                <dt className="text-muted-foreground">Last open recorded</dt>
                <dd>{dateLabel(current.last_opened_at)}</dd>
              </div>
            )}
            {current.last_clicked_at && (
              <div>
                <dt className="text-muted-foreground">Last click recorded</dt>
                <dd>{dateLabel(current.last_clicked_at)}</dd>
              </div>
            )}
          </dl>
          {detail.data?.preview_html ? (
            <details className="text-sm">
              <summary className="cursor-pointer py-2 font-medium">
                View email content
              </summary>
              <p className="mb-2 text-xs text-muted-foreground">
                Images and links are disabled so this preview won’t count as an
                open or click.
              </p>
              <iframe
                title={`Email preview: ${title}`}
                sandbox=""
                className="h-80 w-full rounded-md border bg-white"
                srcDoc={`<!doctype html><html><head><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline';"><style>body{font-family:system-ui;padding:12px;color:#1f2937;overflow-wrap:anywhere}table{max-width:100%}pre{white-space:pre-wrap}</style></head><body>${detail.data.preview_html}</body></html>`}
              />
            </details>
          ) : (
            detail.data?.provider_available && (
              <p className="text-xs text-muted-foreground">
                Email content is no longer available.
              </p>
            )
          )}
        </div>
      )}
    </li>
  );
}

export function MemberEmailLogs({ memberId, leagueId }: Props) {
  const query = clientApi.league.admin.memberEmails.useQuery({
    memberId,
    leagueId,
    includeContent: false,
  });
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Delivery and engagement reported by Resend. No recorded activity
          doesn’t mean an email wasn’t read. Tracking may be disabled or
          blocked, and automated activity can register opens or clicks.
        </p>
        <Button
          variant="ghost"
          size="sm"
          disabled={query.isFetching}
          onClick={() => void query.refetch()}
          aria-label="Refresh email activity"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
      {query.isLoading ? (
        <p role="status">Loading email activity…</p>
      ) : query.isError ? (
        <p role="alert">Couldn’t load email activity. Please try refreshing.</p>
      ) : !query.data?.emails.length ? (
        <p className="text-sm text-muted-foreground">
          No emails have been recorded for this member.
        </p>
      ) : (
        <ScrollArea className="h-[60vh] w-full">
          <ul className="divide-y pr-4">
            {query.data.emails.map((email) => (
              <EmailRow
                key={email.id}
                email={email}
                memberId={memberId}
                leagueId={leagueId}
                listUpdatedAt={query.dataUpdatedAt}
              />
            ))}
          </ul>
        </ScrollArea>
      )}
    </div>
  );
}
