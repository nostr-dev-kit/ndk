// @ndk-version: user-input@0.4.0
/**
 * UserInput - Composable user search/input components
 *
 * A flexible system for searching and selecting Nostr users with NIP-05 and npub support.
 *
 * The `ndk` prop is optional on Root components - if not provided, it will be retrieved from Svelte context.
 *
 * @example Basic usage (ndk from context):
 * ```svelte
 * <UserInput.Root onSelect={(user) => console.log(user)}>
 *   <UserInput.Search placeholder="Search users..." />
 *   <UserInput.Results>
 *     {#snippet resultItem(user)}
 *       <UserInput.ResultItem {user} />
 *     {/snippet}
 *   </UserInput.Results>
 * </UserInput.Root>
 * ```
 */

import Root from './user-input-root.svelte';
import Search from './user-input-search.svelte';
import Results from './user-input-results.svelte';
import ResultItem from './user-input-result-item.svelte';

export const UserInput = {
  Root,
  Search,
  Results,
  ResultItem,
};

export type { UserInputContext } from './context.svelte.js';
