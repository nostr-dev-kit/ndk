// @ndk-version: reply-indicator@0.1.0
/**
 * ReplyIndicator - Shows "Replying to @user" for reply events
 *
 * Automatically detects reply relationships using NIP-10 markers and fetches
 * parent event + author profile.
 *
 * @example Basic usage:
 * ```svelte
 * <ReplyIndicator {ndk} {event} />
 * ```
 *
 * @example Custom styling:
 * ```svelte
 * <ReplyIndicator {ndk} {event} class="text-xs mb-2" />
 * ```
 *
 * @example Custom rendering:
 * ```svelte
 * <ReplyIndicator {ndk} {event}>
 *   {#snippet children({ profile, event: parentEvent, loading })}
 *     {#if profile}
 *       <span>↳ Replying to {profile.displayName}</span>
 *     {/if}
 *   {/snippet}
 * </ReplyIndicator>
 * ```
 */

import ReplyIndicator from './reply-indicator.svelte';

export { ReplyIndicator };
export default ReplyIndicator;
