import { createOnRequestError } from "@axiomhq/nextjs";
import { logger } from "./lib/axiom/logger";

export const onRequestError = createOnRequestError(logger);
