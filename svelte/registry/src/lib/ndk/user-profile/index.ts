/**
 * UserProfile - Composable user profile display components
 *
 * A flexible system for displaying user profiles with customizable layout.
 * Components support both context mode (within UserProfile.Root) and standalone mode (with direct props).
 *
 * @example Context mode:
 * ```svelte
 * <UserProfile.Root {ndk} {pubkey}>
 *   <UserProfile.Avatar />
 *   <UserProfile.Name field="displayName" />
 *   <UserProfile.Field field="about" />
 * </UserProfile.Root>
 * ```
 *
 * @example Standalone mode:
 * ```svelte
 * <UserProfile.Avatar {ndk} {user} size={48} />
 * <UserProfile.Name {ndk} {user} field="displayName" />
 * <UserProfile.Field {ndk} {user} field="about" />
 * ```
 *
 * @example Avatar + Name variant:
 * ```svelte
 * <UserProfile.Root {ndk} {pubkey}>
 *   <div class="flex items-center gap-3">
 *     <UserProfile.Avatar size={40} />
 *     <UserProfile.Name />
 *   </div>
 * </UserProfile.Root>
 * ```
 *
 * @example Avatar + Name + Handle variant:
 * ```svelte
 * <UserProfile.Root {ndk} {pubkey}>
 *   <div class="flex items-center gap-3">
 *     <UserProfile.Avatar size={40} />
 *     <div class="flex flex-col">
 *       <UserProfile.Name />
 *       <UserProfile.Handle />
 *     </div>
 *   </div>
 * </UserProfile.Root>
 * ```
 */

// Core components
import Root from './user-profile-root.svelte';
import Avatar from './user-profile-avatar.svelte';
import AvatarGroup from './avatar-group.svelte';
import Name from './user-profile-name.svelte';
import Field from './user-profile-field.svelte';
import Handle from './user-profile-handle.svelte';
import Bio from './user-profile-bio.svelte';
import HoverCard from './user-profile-hover-card.svelte';
import Horizontal from './user-profile-horizontal.svelte';

// Export as namespace for dot notation
export const UserProfile = {
  Root,
  Avatar,
  AvatarGroup,
  Name,
  Field,
  Handle,
  Bio,
  HoverCard,
  Horizontal,
};

// Export types
export type { UserProfileContext } from './context.svelte.js';
