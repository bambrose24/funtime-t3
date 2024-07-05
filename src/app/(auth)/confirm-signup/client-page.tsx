"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { clientApi } from "~/trpc/react";
import { useRedirectToParam } from "~/utils/hooks/useRedirectToParam";
import { createSupabaseBrowser } from "~/utils/supabase/client";

const signupFormSchema = z.object({
  username: z.string().min(5),
  firstName: z.string(),
  lastName: z.string(),
});

export function ConfirmSignupClientPage() {
  const form = useForm<z.infer<typeof signupFormSchema>>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      username: "",
      firstName: "",
      lastName: "",
    },
  });

  const { mutateAsync: funtimeSignup } = clientApi.auth.signup.useMutation();

  const onSubmit: Parameters<typeof form.handleSubmit>[0] = async (data) => {
    const { username, firstName, lastName } = data;

    const supabase = createSupabaseBrowser();

    const emailRedirectTo = `${window.location.href}/confirm-signup`;

    await funtimeSignup({});

    toast.success(`Check your email to confirm your signup.`);
  };

  return (
    <div className="col-span-12 flex flex-col items-center p-2 pt-8 md:col-span-6 md:col-start-4 lg:col-span-4 lg:col-start-5 2xl:col-span-2 2xl:col-start-6">
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Form {...form}>
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-xl">Sign Up</CardTitle>
              <CardDescription>
                Enter your information to create an account. You&apos;ll have to
                confirm your email.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input {...field} required placeholder="John" />
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
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input {...field} required placeholder="Doe" />
                          </FormControl>
                          <FormDescription />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            required
                            placeholder="john_doe123"
                          />
                        </FormControl>
                        <FormDescription />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <div className="flex w-full flex-col gap-4 text-center text-sm">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={
                    !form.formState.isValid ||
                    form.formState.isSubmitting ||
                    form.formState.isSubmitSuccessful
                  }
                >
                  {form.formState.isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Finish Signup
                </Button>
                <div>
                  Already have an account?{" "}
                  <Link href="/login" className="underline">
                    Sign in
                  </Link>
                </div>
              </div>
            </CardFooter>
          </Card>
        </Form>
      </form>
    </div>
  );
}
