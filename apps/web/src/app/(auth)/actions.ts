"use server";

import { revalidatePath } from "next/cache";

export async function revalidatePathServerAction(
  ...params: Parameters<typeof revalidatePath>
) {
  "use server";
  revalidatePath(...params);
}
