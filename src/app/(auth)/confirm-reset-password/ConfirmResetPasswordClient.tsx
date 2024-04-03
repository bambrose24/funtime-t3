"use client";

import { type SubmitHandler, useForm } from "react-hook-form";
import { type confirmResetPasswordSchema } from "~/lib/schemas/auth";
import { type z } from "zod";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { yupResolver } from "@hookform/resolvers/yup";
import { Input } from "~/components/ui/input";

import { Button } from "~/components/ui/button";
import { clientSupabase } from "~/utils/supabase/client";
import { toast } from "sonner";
import { clientApi } from "~/trpc/react";
import { revalidatePathServerAction } from "../actions";
import * as Yup from "yup";
import { useRouter } from "next/navigation";

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

  const router = useRouter();

  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { invalidate } = clientApi.useUtils();

  const onSubmit: SubmitHandler<ForgotPasswordFormType> = async ({
    password1,
    password2,
  }) => {
    if (password1 !== password2) {
      throw new Error("Passwords must matchhhh");
    }
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

    router.push("/");
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
              {errors.password2?.message && (
                <span>{errors.password2.message}</span>
              )}
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
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
