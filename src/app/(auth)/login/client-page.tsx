"use client";

import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { loginSchema } from "~/lib/schemas/auth";
import { type z } from "zod";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Alert, AlertDescription } from "~/components/ui/alert";
import Link from "next/link";
import { Label } from "~/components/ui/label";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { toast } from "sonner";
import { createSupabaseBrowser } from "~/utils/supabase/client";
import { useRedirectToParam } from "~/utils/hooks/useRedirectToParam";

type LoginFormType = z.infer<typeof loginSchema>;

export function LoginClientPage() {
  const form = useForm<LoginFormType>({
    resolver: zodResolver(loginSchema),
    reValidateMode: "onChange",
  });

  const redirectTo = useRedirectToParam();

  const onSubmit: Parameters<typeof form.handleSubmit>[0] = async (data) => {
    const { email, password } = data;
    const supabase = createSupabaseBrowser();
    const authResponse = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authResponse.error) {
      toast.error(`Error signing in - ${authResponse.error.message}`);
      return;
    }

    toast.success(`Successfully logged in.`);

    window.location.href = redirectTo ?? "/";
  };

  return (
    <div className="col-span-12 flex flex-col items-center p-2 pt-8 md:col-span-6 md:col-start-4 lg:col-span-4 lg:col-start-5 2xl:col-span-2 2xl:col-start-6">
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Form {...form}>
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-2xl">Login</CardTitle>
              <CardDescription>
                Enter your email below to login to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              {redirectTo && (
                <div className="pb-3">
                  <LoginMessage redirectTo={redirectTo} />
                </div>
              )}
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            required
                            tabIndex={1}
                          />
                        </FormControl>
                        <FormDescription />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid gap-2">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <div className="flex items-center">
                            <Label htmlFor="password">Password</Label>
                            <Link
                              href="/forgot-password"
                              className="ml-auto inline-block text-sm underline"
                              tabIndex={3}
                            >
                              Forgot your password?
                            </Link>
                          </div>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            required
                            tabIndex={2}
                          />
                        </FormControl>
                        <FormDescription />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button
                  className="w-full"
                  type="submit"
                  disabled={
                    form.formState.isSubmitting ||
                    !form.formState.isValid ||
                    form.formState.isSubmitSuccessful
                  }
                >
                  {form.formState.isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Login
                </Button>
              </div>
              <div className="mt-4 text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="underline" tabIndex={4}>
                  Sign up
                </Link>
              </div>
            </CardContent>
          </Card>
        </Form>
      </form>
    </div>
  );
}

function LoginMessage({ redirectTo }: { redirectTo: string }) {
  if (redirectTo.includes("/league/create")) {
    return (
      <Alert>
        <AlertDescription>
          You need to log in or{" "}
          <Link href="/signup" className="underline">
            sign up
          </Link>{" "}
          to create a league.
        </AlertDescription>
      </Alert>
    );
  }
  return null;
}
