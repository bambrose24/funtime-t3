import { Body, Container, Head, Html, Preview } from "react-email";
import { EmailButton } from "../components/email-button";
import { EmailH1, EmailText } from "../components/email-text";
import { Provider } from "../provider";

type Props = {
  adminName: string;
  isInitiatorCopy?: boolean;
  joinHref: string;
  nextLeagueName: string;
  priorLeagueName: string;
  recipientCount?: number;
  season: number;
  username: string;
};

export default function LeagueRenewalInvite({
  adminName = "your league admin",
  isInitiatorCopy = false,
  joinHref = "https://www.play-funtime.com/join-league/example",
  nextLeagueName = "Funtime 2026",
  priorLeagueName = "Funtime 2025",
  recipientCount = 0,
  season = 2026,
  username = "friend",
}: Props) {
  const seasonLabel = String(season);

  if (isInitiatorCopy) {
    return (
      <Html lang="en">
        <Head />
        <Preview>Your renewal email for {nextLeagueName}</Preview>
        <Provider>
          <Body className="bg-white font-sans">
            <Container className="flex flex-col items-center">
              <EmailH1>Your {seasonLabel} renewal is ready</EmailH1>
            </Container>
            <Container className="flex flex-col">
              <EmailText>
                Hi {username}, you renewed {priorLeagueName} as {nextLeagueName}{" "}
                for the new season.
              </EmailText>
              <EmailText>
                {recipientCount > 0
                  ? `${recipientCount} ${recipientCount === 1 ? "player was" : "players were"} sent a renewal invitation.`
                  : "There were no returning players selected, so no player invitations were sent."}
              </EmailText>
              <EmailText>
                This is your confirmation copy. You can manage the new league
                and its remaining invitations from the league admin page.
              </EmailText>
            </Container>
            <Container className="flex justify-center">
              <EmailButton href={joinHref}>Open Next Season League</EmailButton>
            </Container>
          </Body>
        </Provider>
      </Html>
    );
  }

  return (
    <Html lang="en">
      <Head />
      <Preview>
        {nextLeagueName} is open for {seasonLabel}
      </Preview>
      <Provider>
        <Body className="bg-white font-sans">
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
        </Body>
      </Provider>
    </Html>
  );
}
