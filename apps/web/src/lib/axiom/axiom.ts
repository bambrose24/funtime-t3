import { Axiom } from "@axiomhq/js";

export const axiomClient = process.env.NEXT_PUBLIC_AXIOM_TOKEN
  ? new Axiom({
      token: process.env.NEXT_PUBLIC_AXIOM_TOKEN,
    })
  : null;
