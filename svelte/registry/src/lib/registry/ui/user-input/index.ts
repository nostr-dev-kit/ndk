// @ndk-version: user-input@0.6.0
/**
 * UserInput - Headless user search/input primitives
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
 *     {#snippet children(result)}
 *       <UserInput.Item {result}>
 *         <User.Root user={result.user}>
 *           <User.AvatarName />
 *         </User.Root>
 *       </UserInput.Item>
 *     {/snippet}
 *   </UserInput.Results>
 * </UserInput.Root>
 * ```
 */

import Root from './user-input-root.svelte';
import Search from './user-input-search.svelte';
import Results from './user-input-results.svelte';
import Item from './user-input-item.svelte';

export const UserInput = {
  Root,
  Search,
  Results,
  Item,
};

export type { UserInputContext } from './user-input.context.js';
