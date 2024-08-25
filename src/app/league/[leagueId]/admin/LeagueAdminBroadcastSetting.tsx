import { type ComponentPropsWithoutRef, useState } from "react";
import remarkGfm from "remark-gfm";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import { Textarea } from "~/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import ReactMarkdown from "react-markdown";
import { clientApi } from "~/trpc/react";
import { toast } from "sonner";
import { cn } from "~/lib/utils";
import { Separator } from "~/components/ui/separator";
import { Card } from "~/components/ui/card";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

interface LeagueAdminBroadcastSettingProps {
  leagueId: number;
  numMembersInLeague: number;
}

export function LeagueAdminBroadcastSetting({
  leagueId,
  numMembersInLeague,
}: LeagueAdminBroadcastSettingProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [message, setMessage] = useState("");

  const { data: canSendBroadcast, data: nextBroadcastTime } =
    clientApi.league.admin.canSendLeagueBroadcast.useQuery({ leagueId });

  const { mutateAsync: sendBroadcast, isPending } =
    clientApi.league.admin.sendBroadcast.useMutation();

  const handleSend = () => {
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmSend = async () => {
    try {
      await sendBroadcast({ leagueId, markdownString: message });
      toast.success("Message broadcasted successfully to all league members.");
      setIsConfirmDialogOpen(false);
      setIsDialogOpen(false);
      setMessage("");
    } catch (error) {
      toast.error("Failed to broadcast message. Please try again.");
    }
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Broadcast a Message
        </h3>
        <span className="text-sm text-muted-foreground">
          Send an email to all league members. Limited to twice per week for
          important announcements or reminders.
        </span>
      </div>
      <div className="flex w-full items-center space-x-2">
        <Button
          type="button"
          variant="secondary"
          onClick={() => setIsDialogOpen(true)}
          disabled={!canSendBroadcast}
          className="w-full"
        >
          Send message
        </Button>
        {!canSendBroadcast && nextBroadcastTime && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <InfoCircledIcon className="h-5 w-5 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  You can send the next broadcast on{" "}
                  {new Date(nextBroadcastTime).toLocaleString()}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="flex flex-col sm:h-[90vh] sm:max-w-[90vw]">
          <DialogHeader>
            <DialogTitle className="text-2xl">Broadcast Message</DialogTitle>
            <p className="text-start text-sm text-muted-foreground">
              This feature allows you to send an email to all league members.
              Use it sparingly (max twice per week) to avoid overwhelming
              players. It is good for important announcements or reminders.
            </p>
            <p className="mt-2 text-start text-sm text-muted-foreground">
              You can format the message with Markdown. Learn about how to use
              Markdown{" "}
              <a
                href="https://www.markdownguide.org/basic-syntax/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                here
              </a>
              .
            </p>
          </DialogHeader>
          <div className="grid flex-grow grid-cols-1 gap-4 overflow-hidden md:grid-cols-2">
            <div className="flex flex-col">
              <h3 className="mb-2 text-lg font-medium">Your Message:</h3>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here..."
                className="h-full min-h-[200px] resize-none p-4"
              />
            </div>
            <div className="flex flex-col">
              <h3 className="mb-2 text-lg font-medium">Message Preview:</h3>
              <Card className="h-full overflow-auto p-4">
                <ReactMarkdown
                  components={{
                    h1: (props) => (
                      <h1 className="mb-4 text-2xl font-bold" {...props} />
                    ),
                    h2: (props) => (
                      <h2 className="mb-3 text-xl font-semibold" {...props} />
                    ),
                    h3: (props) => (
                      <h3 className="mb-2 text-lg font-medium" {...props} />
                    ),
                    p: (props) => <p className="mb-4" {...props} />,
                    ul: (props) => (
                      <ul className="mb-4 list-disc pl-5" {...props} />
                    ),
                    ol: (props) => (
                      <ol className="mb-4 list-decimal pl-5" {...props} />
                    ),
                    li: (props) => <li className="mb-1" {...props} />,
                    blockquote: (props) => (
                      <blockquote
                        className="my-4 border-l-4 border-gray-300 pl-4 italic"
                        {...props}
                      />
                    ),
                    code: ({
                      inline,
                      className,
                      children,
                      ...props
                    }: ComponentPropsWithoutRef<"code"> & {
                      inline?: boolean;
                    }) => {
                      const match = /language-(\w+)/.exec(className ?? "");
                      return !inline && match ? (
                        <pre className="my-4 rounded bg-muted p-2">
                          <code
                            className={cn("text-muted-foreground", className)}
                            {...props}
                          >
                            {children}
                          </code>
                        </pre>
                      ) : (
                        <code
                          className={cn(
                            `rounded bg-muted px-1 text-muted-foreground`,
                            className,
                          )}
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    },
                  }}
                  remarkPlugins={[remarkGfm]}
                  className="prose dark:prose-invert max-w-none"
                >
                  {message}
                </ReactMarkdown>
              </Card>
            </div>
          </div>
          <Separator className="my-4" />
          <DialogFooter className="flex w-full justify-between">
            <Button
              type="button"
              onClick={() => setIsDialogOpen(false)}
              variant="outline"
              className="mr-2 flex-1"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSend}
              disabled={!message.trim() || isPending}
              loading={isPending}
              className="ml-2 flex-1"
            >
              Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Broadcast</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to send this message to all{" "}
              {numMembersInLeague} members of the league?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSend} disabled={isPending}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
