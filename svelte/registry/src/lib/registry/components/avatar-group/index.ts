/**
 * AvatarGroup - Display multiple user avatars
 *
 * Displays multiple user avatars in a stacked group with optional overflow count.
 * Automatically prioritizes showing users that the current user follows.
 *
 * @example Basic usage:
 * ```svelte
 * <script>
 *   import { AvatarGroup } from '/registry/components/avatar-group';
 * </script>
 *
 * <AvatarGroup {ndk} pubkeys={['pubkey1', 'pubkey2', 'pubkey3']} />
 * ```
 *
 * @example With options:
 * ```svelte
 * <AvatarGroup
 *   {ndk}
 *   pubkeys={pubkeys}
 *   max={3}
 *   size={32}
 *   spacing="tight"
 *   skipCurrentUser={true}
 * />
 * ```
 *
 * @example Using the builder directly:
 * ```svelte
 * <script>
 *   import { createAvatarGroup } from '../../builders/avatar-group/index.svelte.js';
 *
 *   const avatarGroup = createAvatarGroup(() => ({
 *     pubkeys: ['pubkey1', 'pubkey2', 'pubkey3'],
 *     skipCurrentUser: true
 *   }), ndk);
 * </script>
 *
 * {#each avatarGroup.users.slice(0, 5) as user}
 *   <User.Avatar {ndk} {user} />
 * {/each}
 * ```
 */

import AvatarGroup from './avatar-group.svelte';

export { AvatarGroup };
export default AvatarGroup;
