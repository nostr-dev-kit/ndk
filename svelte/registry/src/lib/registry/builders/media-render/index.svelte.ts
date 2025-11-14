/**
 * @module builders/media-render
 * Builder for managing media rendering with NSFW filtering and follow-based blurring
 */

import type { NDKEvent } from '@nostr-dev-kit/ndk';
import type { NDKSvelte } from '@nostr-dev-kit/svelte';
import { getNDK } from '../../utils/ndk/index.svelte.js';
import { defaultContentRenderer } from '../../ui/content-renderer/index.js';

export interface MediaRenderState {
	/** Whether media should be blurred */
	shouldBlur: boolean;

	/** Reason for blurring */
	blurReason: string;

	/** Whether media is currently revealed */
	showMedia: boolean;

	/** Reveal the media */
	reveal: () => void;

	/** NSFW tag information */
	nsfwTag: string[] | null;

	/** NSFW reason if available */
	nsfwReason: string | null;

	/** Whether event has NSFW content */
	hasNSFW: boolean;

	/** Whether user follows the event author */
	isFollowing: boolean;
}

export interface MediaRenderConfig {
	/** The event containing media (for NSFW detection and follow checking) */
	event?: NDKEvent;
}

/**
 * Create a media render builder
 *
 * @example
 * ```svelte
 * <script>
 *   import { createMediaRender } from '$lib/registry/builders/media-render';
 *
 *   const mediaState = createMediaRender(() => ({ event }), ndk);
 * </script>
 *
 * {#if mediaState.shouldBlur && !mediaState.showMedia}
 *   <button onclick={mediaState.reveal}>
 *     Click to view: {mediaState.blurReason}
 *   </button>
 * {:else}
 *   <img src={url} />
 * {/if}
 * ```
 */
export function createMediaRender(
	config: () => MediaRenderConfig,
	ndk?: NDKSvelte
): MediaRenderState {
	const ndk = getNDK(ndk);

	const state = $state({
		showMedia: false
	});

	// Check for NSFW content
	const nsfwTag = $derived.by(() => {
		const { event } = config();
		if (!event) return null;
		return event.tags.find((tag) => tag[0] === 'content-warning') || null;
	});

	const nsfwReason = $derived(nsfwTag ? (nsfwTag[1] || 'Sensitive content') : null);
	const hasNSFW = $derived(!!nsfwTag);

	// Check if user follows the event author
	const isFollowing = $derived.by(() => {
		const { event } = config();
		if (!event || !ndk) return true; // Show by default if no context

		const follows = ndk.$follows;
		const currentUser = ndk.$currentUser;

		// If user not logged in, don't filter by follows
		if (!currentUser?.pubkey || !follows) return true;

		// Check if user follows the event author
		return follows.has(event.pubkey);
	});

	// Determine if media should be blurred
	const shouldBlur = $derived.by(() => {
		// Check NSFW first (if global blocking is enabled)
		if (hasNSFW && defaultContentRenderer.blockNsfw) {
			return true;
		}

		// Check follows (only blur if user is logged in and doesn't follow)
		if (!isFollowing && ndk?.$currentUser?.pubkey) {
			return true;
		}

		return false;
	});

	// Blur reason for display
	const blurReason = $derived.by(() => {
		if (hasNSFW && defaultContentRenderer.blockNsfw) {
			return nsfwReason || 'Sensitive content';
		}
		if (!isFollowing) {
			return 'Content from unfollowed user';
		}
		return 'Click to view';
	});

	function reveal() {
		state.showMedia = true;
	}

	return {
		get shouldBlur() {
			return shouldBlur;
		},
		get blurReason() {
			return blurReason;
		},
		get showMedia() {
			return state.showMedia;
		},
		get nsfwTag() {
			return nsfwTag;
		},
		get nsfwReason() {
			return nsfwReason;
		},
		get hasNSFW() {
			return hasNSFW;
		},
		get isFollowing() {
			return isFollowing;
		},
		reveal
	};
}
