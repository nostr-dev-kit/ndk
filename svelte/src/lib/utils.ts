/**
 * Utility functions for NDK Svelte components
 */

/**
 * Combine class names with optional conditional classes
 * @param inputs - Class names to combine
 * @returns Combined class string
 */
export function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(' ');
}

/**
 * Format a timestamp to relative time
 * @param timestamp - Unix timestamp in seconds
 * @returns Formatted time string (e.g., "2h", "3d")
 */
export function formatRelativeTime(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d`;
  if (hours > 0) return `${hours}h`;
  if (minutes > 0) return `${minutes}m`;
  return 'now';
}

/**
 * Format large numbers with K/M suffixes
 * @param num - Number to format
 * @returns Formatted string (e.g., "1.2K", "3.4M")
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

/**
 * Debounce a function call
 * @param fn - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Throttle a function call
 * @param fn - Function to throttle
 * @param limit - Minimum time between calls in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      fn(...args);
    }
  };
}

/**
 * Copy text to clipboard
 * @param text - Text to copy
 * @returns Promise that resolves when copied
 */
export async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(text);
  } else {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }
}

/**
 * Share content using Web Share API or fallback
 * @param data - Share data
 * @returns Promise that resolves when shared
 */
export async function share(data: {
  title?: string;
  text?: string;
  url?: string;
}): Promise<void> {
  if (navigator.share && navigator.canShare?.(data)) {
    await navigator.share(data);
  } else if (data.url) {
    await copyToClipboard(data.url);
  }
}

/**
 * Truncate text with ellipsis
 * @param text - Text to truncate
 * @param length - Maximum length
 * @returns Truncated text
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

/**
 * Generate a random ID
 * @param length - Length of the ID
 * @returns Random ID string
 */
export function generateId(length = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

/**
 * Format a NIP-05 identifier for display
 * Removes the underscore prefix for default usernames (e.g., "_@domain.com" becomes "domain.com")
 * @param nip05 - NIP-05 identifier to format
 * @returns Formatted NIP-05 string
 */
export function formatNip05(nip05: string | undefined): string {
  if (!nip05) return '';

  const NIP05_REGEX = /^(?:([\w.+-]+)@)?([\w.-]+)$/;
  const match = nip05.match(NIP05_REGEX);

  if (!match) return nip05;

  const [_, name = '_', domain] = match;

  // Hide default username
  if (name === '_') {
    return domain;
  }

  return `${name}@${domain}`;
}