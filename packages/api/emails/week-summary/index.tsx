import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Hr,
} from "react-email";
import { Provider } from "../provider";
import { EmailButton } from "../components/email-button";
import { movement, ordinal, type WeekSummary } from "../../utils/weekSummary";

type Props = Omit<WeekSummary, "recipients"> & {
  leagueId: number;
  leagueName: string;
  week: number;
  recipient: WeekSummary["recipients"][number];
};
const cellStyle = {
  borderBottom: "1px solid #e2e8f0",
  padding: "10px 6px",
  textAlign: "left" as const,
};

export default function WeekSummaryEmail({
  leagueId,
  leagueName,
  week,
  standings,
  winnerText,
  totalGames,
  totalMembers,
  nextWeek,
  recipient,
}: Props) {
  const standingsUrl = `https://www.play-funtime.com/league/${leagueId}?week=${week}`;
  return (
    <Html lang="en">
      <Head />
      <Preview>{`${leagueName}: ${recipient.correctPicks} / ${totalGames} correct, ${ordinal(recipient.rank)} this week.`}</Preview>
      <Provider>
        <Body className="bg-white font-sans text-slate-900">
          <Container className="mx-auto max-w-[600px] px-4 py-8">
            <Text className="text-sm text-slate-500">{leagueName}</Text>
            <Text>Hi {recipient.username},</Text>
            <Heading as="h1" className="text-xl">
              Your Week {week}
            </Heading>
            <Text style={{ lineHeight: "28px" }}>
              Correct picks:{" "}
              <strong>
                {recipient.correctPicks} / {totalGames}
              </strong>
              <br />
              Point differential:{" "}
              <strong>{recipient.tiebreakerDiff ?? "N/A"}</strong>
              <br />
              Weekly standing:{" "}
              <strong>
                {recipient.tied ? "Tied " : ""}
                {ordinal(recipient.rank)} of {totalMembers}
              </strong>
              <br />
              Season standing:{" "}
              <strong>
                {ordinal(recipient.seasonRank)}
                {movement(recipient.seasonMovement)}
              </strong>
            </Text>
            <Hr />
            <Heading as="h2" className="text-lg">
              Week {week} results
            </Heading>
            <Text>
              <strong>{winnerText}</strong>
            </Text>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "14px",
              }}
            >
              <thead>
                <tr>
                  {[
                    "Place",
                    "Player",
                    "Correct picks",
                    "Point differential",
                  ].map((label) => (
                    <th key={label} scope="col" style={cellStyle}>
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {standings.map((s, i) => (
                  <tr key={i}>
                    <td style={cellStyle}>{ordinal(s.rank)}</td>
                    <td style={cellStyle}>{s.username}</td>
                    <td style={cellStyle}>
                      {s.correctPicks} / {totalGames}
                    </td>
                    <td style={cellStyle}>{s.tiebreakerDiff ?? "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Text>
              <Link href={standingsUrl}>View full standings</Link>
            </Text>
            {nextWeek !== null ? (
              <EmailButton
                href={`https://www.play-funtime.com/league/${leagueId}/pick`}
              >
                Make your Week {nextWeek} picks
              </EmailButton>
            ) : (
              <Text>Thanks for playing this season!</Text>
            )}
          </Container>
        </Body>
      </Provider>
    </Html>
  );
}
