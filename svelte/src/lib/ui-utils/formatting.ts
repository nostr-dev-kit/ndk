/**
 * Utility functions for NDK Svelte components
 */

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