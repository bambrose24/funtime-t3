type PickOutcome = {
  leagueName: string;
  reason?: string;
  status: "saved" | "skipped";
};

export function getPickSubmissionConfirmation({
  outcomes,
  week,
}: {
  outcomes: PickOutcome[];
  week: number;
}) {
  const savedLeagueNames = outcomes
    .filter((outcome) => outcome.status === "saved")
    .map((outcome) => outcome.leagueName);
  const skippedLeagueNames = outcomes
    .filter((outcome) => outcome.status === "skipped")
    .map((outcome) => outcome.leagueName);
  const prefix = `Your picks are in for week ${week}!\n\n`;

  if (skippedLeagueNames.length) {
    return {
      title: "Some picks saved",
      message: `${prefix}Saved to ${savedLeagueNames.join(", ")}. Skipped ${skippedLeagueNames.join(", ")} because its weekly picks closed at the first kickoff.`,
    };
  }

  return {
    title: "Success!",
    message: `${prefix}You can come back to update them until the applicable league deadline or game kickoff.${savedLeagueNames.length > 1 ? `\n\nThese picks apply to ${savedLeagueNames.join(", ")}.` : ""}`,
  };
}
