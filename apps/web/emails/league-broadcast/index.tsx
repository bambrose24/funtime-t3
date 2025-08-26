import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Section,
} from "@react-email/components";
import { Markdown } from "@react-email/markdown";
import { Provider } from "../provider";

export default function LeagueBroadcastEmail({
  leagueName = "Funtime 2024",
  adminName = "bambrose",
  markdownMessage = `## This is a test message
  
  This is more content
  
  - a list
  - with content
  - here
  
  [league home](https://funtime.com/league/9) link
  
  **bold** and *italics*
  
  _underline_`,
}: {
  leagueName: string;
  adminName: string;
  markdownMessage: string;
}) {
  return (
    <Provider>
      <Html>
        <Head />
        <Body className="bg-white font-sans">
          <Container className="mx-auto py-8">
            <Heading className="mb-4 text-lg">
              This is a message from{" "}
              <span className="underline">{adminName}</span>, an admin of yourrr
              Funtime league <span className="underline">{leagueName}</span>:
            </Heading>
            <Hr className="m-[16px] border-t-2 border-slate-400" />
            <Section className="rounded-lg bg-slate-200 p-4">
              <Markdown>{markdownMessage}</Markdown>
            </Section>
          </Container>
        </Body>
      </Html>
    </Provider>
  );
}
