import { Body, Container, Head, Html } from "react-email";
import * as React from "react";
import { Provider } from "./provider";
import { EmailButton } from "./components/email-button";

export default function Email() {
  return (
    <Html lang="en">
      <Head />
      <Provider>
        <Body className="bg-white font-sans">
          <Container className="">
            <EmailButton variant="primary" href="https://example.com">
              Click me
            </EmailButton>
          </Container>
        </Body>
      </Provider>
    </Html>
  );
}
