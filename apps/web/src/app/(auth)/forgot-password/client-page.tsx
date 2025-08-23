"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { type z } from "zod";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { forgotPasswordSchema } from "~/lib/schemas/auth";
import { createSupabaseBrowser } from "~/utils/supabase/client";
import { revalidatePathServerAction } from "../actions";

type ForgotPasswordFormType = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordClient() {
  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isLoading,
      isSubmitting,
      isSubmitted,
      isSubmitSuccessful,
    },
    watch,
  } = useForm<ForgotPasswordFormType>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const email = watch("email");

  const onSubmit: SubmitHandler<ForgotPasswordFormType> = async ({ email }) => {
    const redirectTo = `${typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}/confirm-reset-password`;
    const clientSupabase = createSupabaseBrowser();
    const { error } = await clientSupabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (error) {
      toast.error(
        "There was an error resetting your password. Contact Bob at bambrose24@gmail.com",
      );
      throw error;
    }

    await revalidatePathServerAction("/", "layout");

    toast.success(
      "Please check your email for instructions on resetting your password.",
    );
  };

  return (
    <div className="col-span-12 flex flex-col items-center p-2 pt-8 md:col-span-6 md:col-start-4 lg:col-span-4 lg:col-start-5 2xl:col-span-2 2xl:col-start-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Reset Password</CardTitle>
          <CardDescription>
            Enter your email to get a password-reset email.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-4">
              <input
                type="hidden"
                name="redirectTo"
                value={
                  typeof window !== "undefined"
                    ? window.location?.origin
                    : "http://localhost:3000"
                }
              />
              <Input placeholder="Email" type="email" {...register("email")} />
              {errors.email && <span>{errors.email.message?.toString()}</span>}
              <Button
                className="w-full"
                disabled={
                  !email ||
                  Boolean(errors.email) ||
                  isLoading ||
                  isSubmitting ||
                  isSubmitted
                }
                loading={isLoading || isSubmitting}
              >
                {isSubmitSuccessful ? "Check your email" : "Reset Password"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
