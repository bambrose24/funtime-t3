"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { loginSchema } from "~/lib/schemas/auth";
import { type z } from "zod";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { login } from "./actions";

type LoginFormType = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const {
    register,
    formState: { errors },
  } = useForm<LoginFormType>({
    resolver: zodResolver(loginSchema),
  });

  return (
    <div className="flex h-full w-full flex-col items-center p-2 pt-8">
      <Card className="md:w-[300px]">
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
              <Button
                className="w-full"
                formAction={login}
                disabled={Boolean(errors.email) || Boolean(errors.password)}
              >
                Login
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
