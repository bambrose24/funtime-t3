"use client";

import { Calculator } from "lucide-react";
import { useEffect, useState } from "react";
import { ScenariosDrawer } from "~/components/league/ScenariosDrawer";
import { ScenariosModal } from "~/components/league/ScenariosModal";
import { Button } from "~/components/ui/button";
import { type RouterOutputs } from "~/trpc/types";

type ScenariosButtonProps = {
  picksSummary: RouterOutputs["league"]["picksSummary"];
  games: RouterOutputs["games"]["getGames"];
  teams: RouterOutputs["teams"]["getTeams"];
  league: RouterOutputs["league"]["get"];
  week: number;
};

export function ScenariosButton(props: ScenariosButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Show button when there are 4 or fewer games remaining (not done)
  const remainingGames = props.games.filter((game) => !game.done);
  const shouldShowButton =
    remainingGames.length > 0 && remainingGames.length <= 4;

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint is 768px
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!shouldShowButton) {
    return null;
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="flex items-center gap-2"
      >
        <Calculator className="h-4 w-4" />
        Scenarios
      </Button>

      {/* Conditionally render either modal or drawer */}
      {isMobile ? (
        <ScenariosDrawer
          {...props}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
        />
      ) : (
        <ScenariosModal
          {...props}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
