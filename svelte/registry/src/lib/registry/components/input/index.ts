// @ndk-version: input@0.6.0
/**
 * Input - Composable user search/input components
 *
 * A flexible system for searching and selecting Nostr users with NIP-05 and npub support.
 *
 * The `ndk` prop is optional on Root components - if not provided, it will be retrieved from Svelte context.
 *
 * @example Basic usage (ndk from context):
 * ```svelte
 * <Input.Root onSelect={(user) => console.log(user)}>
 *   <Input.Search placeholder="Search users..." />
 *   <Input.Results>
 *     {#snippet resultItem(user)}
 *       <Input.ResultItem {user} />
 *     {/snippet}
 *   </Input.Results>
 * </Input.Root>
 * ```
 */

import Root from './user-input-root.svelte';
import Search from './user-input-search.svelte';
import Results from './user-input-results.svelte';
import ResultItem from './user-input-result-item.svelte';

export const Input = {
  Root,
  Search,
  Results,
  ResultItem,
};

export type { UserInputContext as InputContext } from './context.svelte.js';
