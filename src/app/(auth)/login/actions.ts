"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { fullLoginFormSchema } from "~/lib/schemas/auth";
import { supabaseServer } from "~/utils/supabase/server";

export async function login(formData: FormData) {
  const supabase = supabaseServer();

  const { email, password, action } = fullLoginFormSchema.parse({
    email: formData.get("email"),
    password: formData.get("password"),
    action: formData.get("action"),
  });

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect("/error");
  }
  revalidatePath("/", "layout");

  switch (action) {
    case "create-league":
      redirect("/league/create");
    default:
      redirect("/");
  }
}

export async function signup(formData: FormData) {
  const supabase = supabaseServer();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signUp(data);

  if (error) {
    redirect("/error");
  }

  revalidatePath("/", "layout");
  redirect("/");
}
