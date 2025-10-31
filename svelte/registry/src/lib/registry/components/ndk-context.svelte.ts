/**
 * Shared utilities for NDK context handling across all Root components.
 *
 * This module provides a standardized way to retrieve NDK instances,
 * either from props or from Svelte context, reducing boilerplate in Root components.
 */

import { getContext } from 'svelte';
import type { NDKSvelte } from '@nostr-dev-kit/svelte';

/**
 * The context key used for global NDK instance.
 * This should match the key set in +layout.svelte.
 */
const NDK_CONTEXT_KEY = 'ndk';

/**
 * Retrieves NDK instance from either a provided prop or Svelte context.
 *
 * @param providedNdk - Optional NDK instance passed as a prop
 * @returns The resolved NDK instance
 * @throws Error if neither prop nor context provides an NDK instance
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   interface Props {
 *     ndk?: NDKSvelte;
 *   }
 *
 *   let { ndk: providedNdk } = $props();
 *   const ndk = getNDKFromContext(providedNdk);
 * </script>
 * ```
 */
export function getNDKFromContext(providedNdk?: NDKSvelte): NDKSvelte {
  if (providedNdk) {
    return providedNdk;
  }

  const contextNdk = getContext<NDKSvelte>(NDK_CONTEXT_KEY);

  if (!contextNdk) {
    throw new Error(
      'NDK not found. Either provide an `ndk` prop or ensure NDK is set in context via setContext(\'ndk\', ndk) in a parent component.'
    );
  }

  return contextNdk;
}
