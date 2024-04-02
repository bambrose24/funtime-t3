import { z } from "zod";
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const confirmResetPasswordSchema = z
  .object({
    password1: z.string(),
    password2: z.string(),
  })
  .refine((data) => data.password1 === data.password2, {
    message: "Passwords don't match",
  });

export const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Password must contain be 6 characters"),
});
