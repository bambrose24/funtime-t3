import { TRPCError } from "@trpc/server";

export const UnauthorizedError = new TRPCError({
  code: "UNAUTHORIZED",
  message: "You must be logged in to do that.",
});
