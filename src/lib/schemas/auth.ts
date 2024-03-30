import { z } from "zod";
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Password must contain be 6 characters"),
});
