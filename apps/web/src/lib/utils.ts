import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: (ClassValue | undefined)[]) {
  return twMerge(clsx(inputs.filter(Boolean)));
}
