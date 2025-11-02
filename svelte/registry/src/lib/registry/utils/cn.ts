/**
 * Combine class names with optional conditional classes
 * @param inputs - Class names to combine
 * @returns Combined class string
 */
export function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(' ');
}
