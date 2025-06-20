import { z } from "zod";

export const updateUsernameSchema = z.object({
  username: z
    .string()
    .min(8)
    .max(30)
    .regex(/^[A-Za-z\d]+$/),
});
