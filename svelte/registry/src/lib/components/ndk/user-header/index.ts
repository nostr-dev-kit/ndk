// @ndk-version: user-header@0.6.0
/**
 * UserHeader - User profile header components
 *
 * Displays user profile information at the top of profile pages.
 * Supports full variant (inline layout with banner), centered variant (centered layout with banner),
 * and compact variant (no banner).
 *
 * @example Full variant (inline layout):
 * ```svelte
 * <UserHeader.Full {ndk} user={ndkUser} />
 * ```
 *
 * @example Centered variant:
 * ```svelte
 * <UserHeader.Centered {ndk} user={ndkUser} />
 * ```
 *
 * @example Compact variant:
 * ```svelte
 * <UserHeader.Compact {ndk} user={ndkUser} />
 * ```
 *
 * @example With customization:
 * ```svelte
 * <UserHeader.Full
 *   {ndk}
 *   user={ndkUser}
 *   isOwnProfile={false}
 * />
 * ```
 *
 * @example Custom composition:
 * ```svelte
 * <UserProfile.Root {ndk} {user}>
 *   <UserProfile.Banner />
 *   <UserProfile.Avatar size={128} />
 *   <UserProfile.Name />
 *   <UserProfile.Bio />
 *   <FollowAction {ndk} target={user} />
 * </UserProfile.Root>
 * ```
 */

// Pre-composed layouts
import Full from './user-header-full.svelte';
import Compact from './user-header-compact.svelte';
import Centered from './user-header-centered.svelte';

// Export as namespace for dot notation
export const UserHeader = {
  Full,
  Compact,
  Centered,
};
