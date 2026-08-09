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
            Use the button below to sign in and join {nextLeagueName}. Your
            Funtime account keeps the same username you used last season.
          </EmailText>
        </Container>
        <Container className="flex justify-center">
          <EmailButton href={joinHref}>Sign In and Join</EmailButton>
        </Container>
      </Html>
    </Provider>
  );
}
