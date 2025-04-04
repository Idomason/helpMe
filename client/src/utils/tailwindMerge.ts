import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/*
 * Merge multiple Tailwind CSS classes with clsx and tailwind-merge
 * @param inputs - Multiple Tailwind CSS classes to merge
 * @returns Merged Tailwind CSS classes
 *
 * @example
 *
 * cn("bg-red-500", "text-white", "p-4", "rounded-md")
 * // returns "bg-red-500 text-white p-4 rounded-md"
 *
 * cn("bg-red-500", "text-white", "p-4", "rounded-md", {
 *   "bg-blue-500": condition,
 *   "text-black": condition,
 * })
 * // returns "bg-red-500 text-white p-4 rounded-md"
 */

export function cn(...inputs: string[]) {
  return twMerge(clsx(inputs));
}
