import { Container, Html, Preview } from "@react-email/components";
import { EmailH1, EmailText } from "../components/email-text";
import { Provider } from "../provider";
import { EmailButton } from "../components/email-button";

type Props = {
  username: string;
  leagueName: string;
  leagueHomeHref: string;
};

export default function PickReminderEmail({
  username = "User",
  leagueName = "Funtime League",
  leagueHomeHref = "https://www.play-funtime.com/league/1",
}: Props) {
  const headline = `Reminder: Make Your Picks for ${leagueName}`;

  return (
    <Provider>
      <Html>
        <Preview>{headline}</Preview>
        <Container className="flex flex-col items-center">
          <EmailH1>{headline}</EmailH1>
          <EmailText>Hi {username},</EmailText>
          <EmailText>
            This is a friendly reminder to make your picks for {leagueName}. The
            games are starting soon, and we don&apos;t want you to miss out!
          </EmailText>
          <EmailButton href={leagueHomeHref}>Make Your Picks Now</EmailButton>
          <div className="text-xs text-muted-foreground">
            This is an automated email sent at {new Date().toLocaleString()}.
          </div>
        </Container>
      </Html>
    </Provider>
  );
}
