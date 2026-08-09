import { Container, Html, Preview } from "@react-email/components";
import { EmailButton } from "../components/email-button";
import { EmailH1, EmailText } from "../components/email-text";
import { Provider } from "../provider";

type Props = {
  adminName: string;
  joinHref: string;
  nextLeagueName: string;
  priorLeagueName: string;
  season: number;
  username: string;
};

export default function LeagueRenewalInvite({
  adminName = "your league admin",
  joinHref = "https://www.play-funtime.com/join-league/example",
  nextLeagueName = "Funtime 2026",
  priorLeagueName = "Funtime 2025",
  season = 2026,
  username = "friend",
}: Props) {
  const seasonLabel = String(season);

  return (
    <Provider>
      <Html>
        <Preview>
          {nextLeagueName} is open for {seasonLabel}
        </Preview>
        <Container className="flex flex-col items-center">
          <EmailH1>Join the {seasonLabel} season</EmailH1>
        </Container>
        <Container className="flex flex-col">
          <EmailText>
            Hi {username}, {adminName} renewed {priorLeagueName} for the new
            season.
          </EmailText>
          <EmailText>
            Join {nextLeagueName} before week 1 starts to play with last
            year&apos;s players again.
          </EmailText>
        </Container>
        <Container className="flex justify-center">
          <EmailButton href={joinHref}>Join Next Season League</EmailButton>
        </Container>
      </Html>
    </Provider>
  );
}
