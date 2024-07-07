"use client";

import { type SubmitHandler, useForm } from "react-hook-form";
import { type confirmResetPasswordSchema } from "~/lib/schemas/auth";
import { type z } from "zod";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { yupResolver } from "@hookform/resolvers/yup";
import { Input } from "~/components/ui/input";

import { Button } from "~/components/ui/button";
import { createSupabaseBrowser } from "~/utils/supabase/client";
import { toast } from "sonner";
import { clientApi } from "~/trpc/react";
import { revalidatePathServerAction } from "../actions";
import * as Yup from "yup";

type ForgotPasswordFormType = z.infer<typeof confirmResetPasswordSchema>;

const validationSchema = Yup.object({
  password1: Yup.string()
    .min(8, "Your password must be at least 8 characters")
    .required("Password is required"),
  password2: Yup.string()
    .oneOf([Yup.ref("password1")], "Passwords must match")
    .required("Please confirm your password"),
});

export function ConfirmResetPasswordClient() {
  const {
    register,
    handleSubmit,
    formState: { errors, isLoading, isSubmitting },
  } = useForm<ForgotPasswordFormType>({
    resolver: yupResolver(validationSchema),
    mode: "onBlur",
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
    const clientSupabase = createSupabaseBrowser();
    const { error } = await clientSupabase.auth.updateUser({
      password: password1,
    });

    if (error) {
      toast.error(error.message);
      throw error;
    }

    await revalidatePathServerAction("/", "layout");
    await invalidate();

    toast.success("Successfully reset your password.");

    window.location.href = "/";
  };

  return (
    <div className="col-span-12 flex flex-col items-center p-2 pt-8 md:col-span-6 md:col-start-4 lg:col-span-4 lg:col-start-5 2xl:col-span-2 2xl:col-start-6">
      <Card className="w-full">
        <CardHeader>Confirm Password Reset</CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Input
                  placeholder="New Password"
                  type="password"
                  {...register("password1")}
                />
                <Input
                  placeholder="Confirm Password"
                  type="password"
                  {...register("password2")}
                />
                {errors.password2?.message && (
                  <span>{errors.password2.message}</span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  className="w-full"
                  disabled={
                    Boolean(errors.password2?.message) ||
                    isLoading ||
                    isSubmitting
                  }
                  loading={isLoading || isSubmitting}
                >
                  Confirm Reset
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
