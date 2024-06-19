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
  const {
    register,
    formState: { errors },
  } = useForm<LoginFormType>({
    resolver: zodResolver(loginSchema),
  });

  return (
    <div className="col-span-8 col-start-3 flex h-full w-full flex-col items-center p-2 pt-8 md:col-span-4 md:col-start-5">
      <Card className="w-full">
        <CardHeader>Login</CardHeader>
        <CardContent>
          <div className="flex flex-col">
            <form action={login}>
              <Input placeholder="Email" type="email" {...register("email")} />
              <div className="pt-4" />
              {errors.email && <span>{errors.email.message?.toString()}</span>}
              <Input
                placeholder="Password"
                type="password"
                {...register("password")}
              />
              {errors.password && (
                <span>
                  <Text.Small>{errors.password.message?.toString()}</Text.Small>
                </span>
              )}
              <div className="pt-4" />
              <LoginButton
                hasErrors={Boolean(errors.email) || Boolean(errors.password)}
              />
              <div className="pt-2" />
              <ForgotPasswordButton />
            </form>
          </div>
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

function ForgotPasswordButton() {
  const router = useRouter();
  return (
    <Button
      className="w-full"
      variant="outline"
      onClick={(e) => {
        e.preventDefault();
        router.push("/forgot-password");
      }}
    >
      Forgot Password?
    </Button>
  );
}
