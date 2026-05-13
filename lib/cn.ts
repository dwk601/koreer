import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Tailwind-aware class name joiner.
 *
 *   cn("px-2 py-1", condition && "bg-red-500", "px-3") // -> "py-1 bg-red-500 px-3"
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
