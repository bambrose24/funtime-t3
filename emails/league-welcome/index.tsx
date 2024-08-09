import { Container, Html, Preview } from "@react-email/components";
import { EmailH1, EmailText } from "../../emails/components/email-text";
import { Provider } from "../../emails/provider";
import { EmailButton } from "../../emails/components/email-button";

type Props = {
  leagueHomeHref: string;
  leagueName: string;
  username: string;
  season: number;
  admin: {
    email: string;
    username: string;
  };
};

export default function LeagueWelcome({
  username = "Bob",
  leagueName = "Funtime 2024",
  leagueHomeHref = "https://new.play-funtime.com/league/9",
  season = 2024,
  admin = { email: "bambrose24@gmail.com", username: "bambrose" },
}: Props) {
  return (
    <Provider>
      <Html>
        <Preview>
          Welcome to {leagueName}, {username}!
        </Preview>
        <Container className="flex flex-col items-center">
          <EmailH1>
            Welcome to {leagueName}, {username}!
          </EmailH1>
        </Container>
        <Container className="flex flex-col">
          <EmailText>
            You are all set for the {season} season. You will receive emails
            from this address when you make picks, reminders for picks, as well
            as standings overviews.
          </EmailText>
        </Container>
        <Container className="flex flex-col">
          <EmailText>
            If you have any questions, please reach out to your league admin{" "}
            <a href={`mailto:${admin.email}`}>{admin.username}</a>.
          </EmailText>
        </Container>
        <Container className="flex justify-center">
          <EmailButton href={leagueHomeHref}>League Home</EmailButton>
        </Container>
      </Html>
    </Provider>
  );
}
