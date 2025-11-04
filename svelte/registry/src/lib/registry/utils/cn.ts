import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combine class names with optional conditional classes
 * Merges Tailwind CSS classes properly to handle conflicts
 * @param inputs - Class names to combine
 * @returns Combined class string
 */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
