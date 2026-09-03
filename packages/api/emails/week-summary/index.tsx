import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from "react-email";
import { Provider } from "../provider";

type Standing = {
  rank: number;
  username: string;
  correctPicks: number;
  seasonTotal: number;
};

type Recipient = {
  username: string;
  rank: number;
  correctPicks: number;
  seasonRank: number;
  seasonTotal: number;
  seasonMovement: number | null;
  tiebreakerPick: number | null;
  tiebreakerDiff: number | null;
  picks: Array<{
    game: string;
    pick: string;
    result: "Correct" | "Wrong" | "Pending";
  }>;
};

type Props = {
  leagueId: number;
  leagueName: string;
  week: number;
  standings: Standing[];
  weekWinners: string[];
  tiebreakerTotal: number | null;
  recipient: Recipient;
};

const cellClassName = "border-b border-slate-200 px-2 py-2 text-left";

export default function WeekSummaryEmail({
  leagueId = 1,
  leagueName = "Funtime League",
  week = 1,
  standings = [],
  weekWinners = [],
  tiebreakerTotal = null,
  recipient = {
    username: "friend",
    rank: 1,
    correctPicks: 0,
    seasonRank: 1,
    seasonTotal: 0,
    seasonMovement: null,
    tiebreakerPick: null,
    tiebreakerDiff: null,
    picks: [],
  },
}: Props) {
  const movementText =
    recipient.seasonMovement === null
      ? "no prior week comparison"
      : recipient.seasonMovement === 0
        ? "no rank change"
        : recipient.seasonMovement > 0
          ? `up ${recipient.seasonMovement}`
          : `down ${Math.abs(recipient.seasonMovement)}`;
  const winnerText = weekWinners.length > 0 ? weekWinners.join(", ") : "TBD";

  return (
    <Html lang="en">
      <Head />
      <Preview>{`${leagueName} Week ${week} summary`}</Preview>
      <Provider>
        <Body className="bg-white font-sans text-slate-900">
          <Container className="mx-auto max-w-[600px] py-8">
            <Heading className="mb-2 text-2xl">
              Week {week} Summary — {leagueName}
            </Heading>
            <Text>
              Hi {recipient.username}, you finished{" "}
              <strong>#{recipient.rank}</strong> with{" "}
              <strong>{recipient.correctPicks}</strong> correct picks this week.
            </Text>
            <Text>
              Week winner(s): <strong>{winnerText}</strong>.{" "}
              {tiebreakerTotal === null
                ? "No completed tiebreaker total."
                : `Tiebreaker total: ${tiebreakerTotal}.`}
            </Text>
            {recipient.tiebreakerPick !== null &&
            recipient.tiebreakerDiff !== null ? (
              <Text>
                Your tiebreaker pick: {recipient.tiebreakerPick} (
                {recipient.tiebreakerDiff} off).
              </Text>
            ) : null}
            <Text>
              Season: <strong>#{recipient.seasonRank}</strong>,{" "}
              <strong>{recipient.seasonTotal}</strong> correct ({movementText}).
            </Text>

            <Heading as="h2" className="mt-6 text-lg">
              Week standings
            </Heading>
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className={cellClassName}>Rank</th>
                  <th className={cellClassName}>Player</th>
                  <th className={cellClassName}>Correct</th>
                  <th className={cellClassName}>Season</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((standing) => (
                  <tr key={`${standing.rank}-${standing.username}`}>
                    <td className={cellClassName}>{standing.rank}</td>
                    <td className={cellClassName}>{standing.username}</td>
                    <td className={cellClassName}>{standing.correctPicks}</td>
                    <td className={cellClassName}>{standing.seasonTotal}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <Heading as="h2" className="mt-6 text-lg">
              Your picks
            </Heading>
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className={cellClassName}>Game</th>
                  <th className={cellClassName}>Pick</th>
                  <th className={cellClassName}>Result</th>
                </tr>
              </thead>
              <tbody>
                {recipient.picks.length > 0 ? (
                  recipient.picks.map((pick, index) => (
                    <tr key={`${pick.game}-${index}`}>
                      <td className={cellClassName}>{pick.game}</td>
                      <td className={cellClassName}>{pick.pick}</td>
                      <td className={cellClassName}>{pick.result}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className={cellClassName} colSpan={3}>
                      No picks submitted.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <Text className="mt-6">
              <Link
                className="text-primary underline"
                href={`https://www.play-funtime.com/league/${leagueId}?week=${week}`}
              >
                View league details
              </Link>
            </Text>
          </Container>
        </Body>
      </Provider>
    </Html>
  );
}
