"use client";

import { type SubmitHandler, useForm } from "react-hook-form";
import { type confirmResetPasswordSchema } from "~/lib/schemas/auth";
import { type z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { yupResolver } from "@hookform/resolvers/yup";
import { Input } from "~/components/ui/input";

import { Button } from "~/components/ui/button";
import { createSupabaseBrowser } from "~/utils/supabase/client";
import { toast } from "sonner";
import { clientApi } from "~/trpc/react";
import { revalidatePathServerAction } from "../actions";
import * as Yup from "yup";
import { Separator } from "~/components/ui/separator";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";

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
  const form = useForm<ForgotPasswordFormType>({
    resolver: yupResolver(validationSchema),
    mode: "onBlur",
  });

  const {
    handleSubmit,
    formState: { isLoading, isSubmitting },
    control,
  } = form;

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
        <CardHeader>
          <CardTitle>Confirm Password Reset</CardTitle>
          <CardDescription>Please enter your new password.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-4">
              <FormField
                control={control}
                name="password1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="New Password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="password2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Confirm Password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Separator />
              <div className="flex flex-col gap-2">
                <Button
                  className="w-full"
                  disabled={isLoading || isSubmitting}
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
