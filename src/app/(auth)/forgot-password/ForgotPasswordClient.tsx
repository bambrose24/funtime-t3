"use client";

import { SubmitHandler, useForm } from "react-hook-form";
import { forgotPasswordSchema } from "~/lib/schemas/auth";
import { type z } from "zod";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "~/components/ui/input";
import { resetPassword } from "./actions";
import { Button } from "~/components/ui/button";
import { useFormStatus } from "react-dom";
import { clientSupabase } from "~/utils/supabase/client";
import { toast } from "sonner";

type ForgotPasswordFormType = z.infer<typeof forgotPasswordSchema>;

const onSubmit: SubmitHandler<ForgotPasswordFormType> = async ({ email }) => {
  console.log("hi resetting on client..", window.location.origin);
  const { error } = await clientSupabase.auth.resetPasswordForEmail(email, {
    redirectTo:
      typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost:3000",
  });

  if (error) {
    throw error;
  }

  toast.success(
    "Please check your email for instructions on resetting your password.",
  );
};

export function ForgotPasswordClient() {
  const {
    register,
    handleSubmit,
    formState: { errors, isLoading, isSubmitting },
  } = useForm<ForgotPasswordFormType>({
    resolver: zodResolver(forgotPasswordSchema),
  });

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
              <ForgotPasswordButton
                hasErrors={Boolean(errors.email)}
                loading={isLoading || isSubmitting}
              />
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ForgotPasswordButton({
  hasErrors,
  loading,
}: {
  hasErrors: boolean;
  loading: boolean;
}) {
  return (
    <Button
      className="w-full"
      disabled={hasErrors || loading}
      loading={loading}
    >
      Forgot Password
    </Button>
  );
}
