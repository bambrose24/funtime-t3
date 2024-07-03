"use client";

import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { loginSchema } from "~/lib/schemas/auth";
import { type z } from "zod";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { login } from "./actions";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";

type LoginFormType = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const form = useForm<LoginFormType>({
    resolver: zodResolver(loginSchema),
    reValidateMode: "onChange",
  });

  const {
    register,
    formState: { errors },
  } = form;

  const router = useRouter();

  return (
    <div className="col-span-8 col-start-3 flex flex-col items-center p-2 pt-8 md:col-span-4 md:col-start-5 2xl:col-span-2 2xl:col-start-6">
      <Card className="md:w-[300px]">
        <CardHeader>Login</CardHeader>
        <CardContent>
          <form action={login}>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3">
                <Input
                  placeholder="Email"
                  type="email"
                  {...register("email")}
                />
                {errors.email && (
                  <span>{errors.email.message?.toString()}</span>
                )}
                <Input
                  placeholder="Password"
                  type="password"
                  {...register("password")}
                />
                {errors.password && (
                  <span>
                    <Text.Small>
                      {errors.password.message?.toString()}
                    </Text.Small>
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <LoginButton
                  hasErrors={Boolean(errors.email) || Boolean(errors.password)}
                />
                <Button
                  className="w-full"
                  variant="outline"
                  type="button"
                  onClick={() => {
                    router.push("/forgot-password");
                  }}
                >
                  Forgot Password?
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function LoginButton({ hasErrors }: { hasErrors: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button
      className="w-full"
      formAction={login}
      disabled={hasErrors || pending}
    >
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Login
    </Button>
  );
}
