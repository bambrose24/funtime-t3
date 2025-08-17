import { Column, Container, Html, Preview, Row } from "@react-email/components";
import { format } from "date-fns-tz";
import { chunk, orderBy } from "lodash";
import { EmailButton } from "../../emails/components/email-button";
import { EmailH1, EmailText } from "../../emails/components/email-text";
import { Provider } from "../../emails/provider";
import { cn } from "../../lib/utils";

type League = {
  name: string;
  leagueId: number;
};

type Pick = {
  homeTeam: string;
  awayTeam: string;
  time: Date;
  chosen: "home" | "away";
  score?: number;
};

type Props = {
  leagues: League[];
  username: string;
  week: number;
  picks: Pick[];
};

export default function PicksConfirmationEmail({
  username = "bambrose",
  leagues = [
    {
      leagueId: 9,
      name: "Funtime 2024",
    },
  ],
  week = 1,
  picks: picksProp = [
    {
      awayTeam: "NE",
      homeTeam: "PHI",
      time: new Date("2024-09-08T00:00:00.000Z"),
      chosen: "home",
    },
    {
      awayTeam: "NE",
      homeTeam: "PHI",
      time: new Date("2024-09-08T12:00:00.000Z"),
      chosen: "away",
    },
    {
      awayTeam: "NE",
      homeTeam: "PHI",
      time: new Date("2024-09-10T13:00:00.000Z"),
      chosen: "home",
    },
    {
      awayTeam: "NE",
      homeTeam: "PHI",
      time: new Date("2024-09-10T16:15:00.000Z"),
      chosen: "home",
      score: 24,
    },
  ],
}: Props) {
  const picksSorted = orderBy(
    picksProp,
    [(p) => p.time, (p) => (p.score && p.score > 0 ? 1 : 0)],
    ["asc", "desc"],
  );
  const headline = `Your picks for Week ${week.toString()} for ${leagues.length === 1 ? `${leagues.at(0)?.name ?? ""}` : `${leagues.length} leagues`}`;

  const picks = chunk(picksSorted, 2);
  return (
    <Provider>
      <Html>
        <Preview>{headline}</Preview>
        <Container className="flex flex-col items-center">
          <EmailH1>{headline}</EmailH1>
        </Container>
        <Container className="flex flex-col items-center">
          <EmailText>
            {leagues.length > 1
              ? `You submitted picks for ${leagues.length} leagues, ${username}. Your picks for these leagues are below.`
              : `Your picks for ${leagues.at(0)?.name ?? ""} are below, ${username}.`}{" "}
            If you have already submitted picks, the latest submission is the
            one that counts up until the games start.
          </EmailText>
        </Container>
        <Container className="flex justify-center">
          {picks.map((pickChunk, chunkIdx) => {
            return (
              <Row key={chunkIdx}>
                {pickChunk.map((pick, pickIdx) => {
                  return (
                    <Column key={pickIdx} className="w-[150px] px-2 py-1">
                      <Container className="m-2 flex flex-col items-center justify-center gap-2 rounded bg-slate-200 p-1">
                        <Row className="flex gap-2">
                          <span
                            className={cn("font-mono text-base", {
                              underline: pick.chosen === "away",
                            })}
                          >
                            {pick.awayTeam}
                          </span>
                          <span className="px-2 font-mono text-base">@</span>
                          <span
                            className={cn("font-mono text-base", {
                              underline: pick.chosen === "home",
                            })}
                          >
                            {pick.homeTeam}
                          </span>
                          <span>
                            {" - "}
                            {pick.chosen === "away"
                              ? pick.awayTeam
                              : pick.homeTeam}
                          </span>
                        </Row>
                        {/* <Row className="flex justify-center font-mono text-xs">
                          {format(pick.time, "M/d/yy h:mm a", {
                            timeZone: EASTERN_TIMEZONE,
                          })}
                        </Row> */}
                        {pick.score && pick.score > 0 ? (
                          <Row className="flex justify-center font-mono text-sm text-muted-foreground">
                            Score: {pick.score}
                          </Row>
                        ) : null}
                      </Container>
                    </Column>
                  );
                })}
              </Row>
            );
          })}
        </Container>
        <Container className="flex w-full justify-center">
          {leagues.length > 1 ? (
            <EmailButton
              href={`https://www.play-funtime.com`}
              className="w-full"
            >
              Funtime Home
            </EmailButton>
          ) : (
            <EmailButton
              href={`https://www.play-funtime.com/league/${leagues.at(0)?.leagueId}`}
              className="w-full"
            >
              League Home
            </EmailButton>
          )}
        </Container>
        <Container className="mt-4 text-xs text-muted-foreground">
          This email was sent at {format(new Date(), "M/d/yy h:mm a")} UTC.
        </Container>
      </Html>
    </Provider>
  );
}
