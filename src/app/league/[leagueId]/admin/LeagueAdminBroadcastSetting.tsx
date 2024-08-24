import { useState } from "react";
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
    <div className="flex w-full items-center justify-between py-4">
      <span>Broadcast a Message</span>
      <Button
        type="button"
        variant="secondary"
        onClick={() => setIsDialogOpen(true)}
      >
        Send message
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="flex flex-col sm:h-[90vh] sm:max-w-[90vw]">
          <DialogHeader>
            <DialogTitle>Broadcast Message</DialogTitle>
          </DialogHeader>
          <div className="grid flex-grow grid-cols-1 gap-4 overflow-hidden md:grid-cols-2">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              className="h-full resize-none"
            />
            <div className="overflow-auto">
              <ReactMarkdown>{message}</ReactMarkdown>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" onClick={handleSend}>
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
