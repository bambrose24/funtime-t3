"use client";

import { type SubmitHandler, useForm } from "react-hook-form";
import { confirmResetPasswordSchema } from "~/lib/schemas/auth";
import { type z } from "zod";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "~/components/ui/input";

import { Button } from "~/components/ui/button";
import { clientSupabase } from "~/utils/supabase/client";
import { toast } from "sonner";
import { revalidatePath } from "next/cache";
import { clientApi } from "~/trpc/react";

type ForgotPasswordFormType = z.infer<typeof confirmResetPasswordSchema>;

export function ConfirmResetPasswordClient() {
  const {
    register,
    handleSubmit,
    formState: { errors, isLoading, isSubmitting },
  } = useForm<ForgotPasswordFormType>({
    resolver: zodResolver(confirmResetPasswordSchema),
  });

  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { invalidate } = clientApi.useUtils();

  const onSubmit: SubmitHandler<ForgotPasswordFormType> = async ({
    password1,
    password2,
  }) => {
    if (password1 !== password2) {
      throw new Error("Passwords must match");
    }
    const { error } = await clientSupabase.auth.updateUser({
      password: password1,
    });

    if (error) {
      throw error;
    }

    await invalidate();

    revalidatePath("/", "layout");

    toast.success("Successfully reset your password.");
  };

  return (
    <div className="flex h-full w-full flex-col items-center p-2 pt-8">
      <Card className="md:w-[300px]">
        <CardHeader>Confirm Password Reset</CardHeader>
        <CardContent>
          <div className="flex flex-col">
            <form onSubmit={handleSubmit(onSubmit)}>
              <Input
                placeholder="New Password"
                type="password"
                {...register("password1")}
              />
              <div className="pt-4" />
              <Input
                placeholder="Confirm Password"
                type="password"
                {...register("password2")}
              />
              <div className="pt-4" />
              {errors.root && errors.root.message && (
                <span>{errors.root.message}</span>
              )}
              <Button
                className="w-full"
                disabled={
                  Object.keys(errors).length > 0 || isLoading || isSubmitting
                }
                loading={isLoading || isSubmitting}
              >
                Confirm Reset
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
