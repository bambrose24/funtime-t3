import { Button, Container, Html, Link } from "@react-email/components";
import * as React from "react";
import { Provider } from "./provider";
import { EmailButton } from "./components/email-button";

export default function Email() {
  return (
    <Provider>
      <Html>
        <Container className="">
          <EmailButton variant="primary" href="https://example.com">
            Click me
          </EmailButton>
        </Container>
      </Html>
    </Provider>
  );
}
