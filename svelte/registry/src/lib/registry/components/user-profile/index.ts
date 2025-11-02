// @ndk-version: user-profile@0.15.0
/**
 * UserProfile - Composable user profile display components
 *
 * A flexible system for displaying user profiles with customizable layout.
 * Components support both context mode (within UserProfile.Root) and standalone mode (with direct props).
 *
 * The `ndk` prop is optional on Root components - if not provided, it will be retrieved from Svelte context.
 * Ensure NDK is set in context via `setContext('ndk', ndk)` in a parent component (e.g., +layout.svelte).
 *
 * @example Context mode (ndk from context):
 * ```svelte
 * <UserProfile.Root {pubkey}>
 *   <UserProfile.Avatar />
 *   <UserProfile.Name field="displayName" />
 *   <UserProfile.Field field="about" />
 * </UserProfile.Root>
 * ```
 *
 * @example Context mode (explicit ndk):
 * ```svelte
 * <UserProfile.Root {ndk} {pubkey}>
 *   <UserProfile.Avatar />
 *   <UserProfile.Name field="displayName" />
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
 * <UserProfile.Root {pubkey}>
 *   <div class="flex items-center gap-3">
 *     <UserProfile.Avatar size={40} />
 *     <UserProfile.Name />
 *   </div>
 * </UserProfile.Root>
 * ```
 */

// Core components
import Root from './user-profile-root.svelte';
import Avatar from './user-profile-avatar.svelte';
import Name from './user-profile-name.svelte';
import Field from './user-profile-field.svelte';
import Handle from './user-profile-handle.svelte';
import Bio from './user-profile-bio.svelte';
import Banner from './user-profile-banner.svelte';
import Nip05 from './user-profile-nip05.svelte';
import AvatarName from './user-profile-avatar-name.svelte';
import { AvatarGroup } from '../avatar-group/index.js';

// Export as namespace for dot notation
export const UserProfile = {
  Root,
  Avatar,
  Name,
  Field,
  Handle,
  Bio,
  Banner,
  Nip05,
  AvatarName,
  AvatarGroup,
};

// Export types
export type { UserProfileContext } from './context.svelte.js';
