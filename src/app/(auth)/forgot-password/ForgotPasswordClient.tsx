"use client";

import { type SubmitHandler, useForm } from "react-hook-form";
import { forgotPasswordSchema } from "~/lib/schemas/auth";
import { type z } from "zod";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { clientSupabase } from "~/utils/supabase/client";
import { toast } from "sonner";
import { revalidatePath } from "next/cache";

type ForgotPasswordFormType = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordClient() {
  const {
    register,
    handleSubmit,
    formState: { errors, isLoading, isSubmitting, isSubmitted },
  } = useForm<ForgotPasswordFormType>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit: SubmitHandler<ForgotPasswordFormType> = async ({ email }) => {
    const redirectTo = `${typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}/confirm-reset-password`;
    console.log("redirect to?");
    const { error } = await clientSupabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (error) {
      throw error;
    }
    revalidatePath("/", "layout");

    toast.success(
      "Please check your email for instructions on resetting your password.",
    );
  };

  return (
    <div className="flex h-full w-full flex-col items-center p-2 pt-8">
      <Card className="md:w-[300px]">
        <CardHeader>Forgot Password</CardHeader>
        <CardContent>
          <div className="flex flex-col">
            <form onSubmit={handleSubmit(onSubmit)}>
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
              <div className="pt-4" />
              {errors.email && <span>{errors.email.message?.toString()}</span>}
              <div className="pt-4" />
              <Button
                className="w-full"
                disabled={
                  Boolean(errors.email) ||
                  isLoading ||
                  isSubmitting ||
                  isSubmitted
                }
                loading={isLoading || isSubmitting}
              >
                Forgot Password
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
