"use client";

import { createContext, useContext, useState } from "react";
import { MessagesSquare } from "lucide-react";
import { LeagueChat } from "~/components/messages/LeagueChat";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";

type ChatTarget = {
  leagueId: number;
  leagueName: string;
};

type ChatLayerContextValue = {
  openChat: (target: ChatTarget) => void;
  closeChat: () => void;
};

const ChatLayerContext = createContext<ChatLayerContextValue | null>(null);

export function ChatLayerProvider({ children }: { children: React.ReactNode }) {
  const [chatTarget, setChatTarget] = useState<ChatTarget | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openChat = (target: ChatTarget) => {
    setChatTarget(target);
    setIsOpen(true);
  };

  const closeChat = () => setIsOpen(false);

  return (
    <ChatLayerContext.Provider value={{ openChat, closeChat }}>
      {children}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        {chatTarget ? (
          <SheetContent
            side="right"
            className="flex h-full w-full max-w-none flex-col gap-0 overflow-hidden rounded-none border-border/80 bg-background p-0 shadow-2xl max-md:inset-x-0 max-md:inset-y-auto max-md:bottom-0 max-md:right-auto max-md:top-auto max-md:h-[100dvh] max-md:w-full max-md:max-w-none max-md:rounded-t-[1.25rem] max-md:border-l-0 max-md:border-t max-md:[--tw-enter-translate-x:0px] max-md:[--tw-exit-translate-x:0px] max-md:data-[state=closed]:slide-out-to-bottom max-md:data-[state=open]:slide-in-from-bottom sm:max-w-[30rem] md:max-w-[32rem]"
          >
            <SheetHeader className="sr-only">
              <SheetTitle className="flex items-center gap-2">
                <MessagesSquare className="h-5 w-5" />
                Chat panel
              </SheetTitle>
              <SheetDescription>
                Read and send messages in {chatTarget.leagueName}.
              </SheetDescription>
            </SheetHeader>
            <LeagueChat
              leagueId={chatTarget.leagueId}
              leagueName={chatTarget.leagueName}
              embedded
            />
          </SheetContent>
        ) : null}
      </Sheet>
    </ChatLayerContext.Provider>
  );
}

export function useChatLayer() {
  const context = useContext(ChatLayerContext);
  if (!context) {
    throw new Error("useChatLayer must be used within ChatLayerProvider");
  }
  return context;
}
