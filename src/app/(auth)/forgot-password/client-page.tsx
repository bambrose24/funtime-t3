"use client";

import { type SubmitHandler, useForm } from "react-hook-form";
import { forgotPasswordSchema } from "~/lib/schemas/auth";
import { type z } from "zod";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { createSupabaseBrowser } from "~/utils/supabase/client";
import { toast } from "sonner";
import { revalidatePathServerAction } from "../actions";

type ForgotPasswordFormType = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordClient() {
  const {
    register,
    handleSubmit,
    formState: { errors, isLoading, isSubmitting, isSubmitted },
    watch,
  } = useForm<ForgotPasswordFormType>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const email = watch("email");

  const onSubmit: SubmitHandler<ForgotPasswordFormType> = async ({ email }) => {
    const redirectTo = `${typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}/confirm-reset-password`;
    console.log("redirectTo?", redirectTo);
    const clientSupabase = createSupabaseBrowser();
    const { error } = await clientSupabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (error) {
      throw error;
    }

    await revalidatePathServerAction("/", "layout");

    toast.success(
      "Please check your email for instructions on resetting your password.",
    );
  };

  return (
    <div className="col-span-12 flex flex-col items-center p-2 pt-8 md:col-span-4 md:col-start-5 2xl:col-span-2 2xl:col-start-5">
      <Card className="w-full">
        <CardHeader>Reset Password</CardHeader>
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
                Reset Password
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}