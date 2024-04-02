"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { forgotPasswordSchema } from "~/lib/schemas/auth";
import { supabaseServer } from "~/utils/supabase/server";
import { z } from "zod";

export async function resetPassword(formData: FormData) {
  const supabase = supabaseServer();

  const { email } = forgotPasswordSchema.parse({
    email: formData.get("email"),
  });

  const { redirectTo } = z
    .object({ redirectTo: z.string() })
    .parse({ redirectTo: formData.get("redirectTo") });

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) {
    redirect("/error");
  }
  revalidatePath("/", "layout");
  redirect("/");
}
