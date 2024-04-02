"use server";

import { revalidatePath } from "next/cache";

export async function revalidatePaths() {
  "use server";
  revalidatePath("/", "layout");
}
