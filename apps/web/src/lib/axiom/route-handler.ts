import {
  createAxiomRouteHandler,
  transformRouteHandlerErrorResult,
  transformRouteHandlerSuccessResult,
} from "@axiomhq/nextjs";

import { logger } from "./logger";

export const withAxiom = createAxiomRouteHandler(logger, {
  onError: (error) => {
    const [message, report] = transformRouteHandlerErrorResult(error);
    logger.error(message, report);
    void logger.flush();
  },
  onSuccess: (data) => {
    const [message, report] = transformRouteHandlerSuccessResult(data);
    logger.info(message, report);
    void logger.flush();
  },
});
