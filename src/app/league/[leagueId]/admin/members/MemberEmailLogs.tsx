"use client";

import { useState } from "react";
import { format } from "date-fns";
import { clientApi } from "~/trpc/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { ScrollArea } from "~/components/ui/scroll-area";

type Props = {
  memberId: number;
  leagueId: number;
};

export function MemberEmailLogs({ memberId, leagueId }: Props) {
  const { data, isLoading } = clientApi.league.admin.memberEmails.useQuery({
    memberId,
    leagueId,
  });
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const emails = data?.emails;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!emails || emails.length === 0) {
    return <div>No emails found</div>;
  }

  return (
    <ScrollArea className="h-[60vh] w-full">
      <div className="pr-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Subject</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {emails.map((email) => {
              const subject = email.resend_data?.subject ?? "No subject";
              const date = email.resend_data?.created_at
                ? format(
                    new Date(email.resend_data.created_at),
                    "M/d/yyyy h:mm a",
                  )
                : "No date";
              const htmlContent = email.resend_data?.html ?? null;

              return (
                <TableRow key={email.id}>
                  <TableCell>{subject}</TableCell>
                  <TableCell>{date}</TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          onClick={() => setSelectedEmail(htmlContent)}
                        >
                          View Content
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Email Preview</DialogTitle>
                        </DialogHeader>
                        <div className="bg-white text-black">
                          <div
                            dangerouslySetInnerHTML={{
                              __html: selectedEmail ?? "",
                            }}
                            className="prose max-w-none"
                          />
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </ScrollArea>
  );
}
