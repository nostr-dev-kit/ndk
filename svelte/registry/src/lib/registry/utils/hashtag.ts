import { deterministicPubkeyGradient } from '@nostr-dev-kit/svelte';

/**
 * Generate a deterministic gradient based on a hashtag string
 * @param tag - Hashtag (with or without # prefix)
 * @returns CSS gradient string
 */
export function hashtagGradient(tag: string): string {
	// Remove # if present and convert to lowercase
	const cleanTag = tag.replace(/^#/, '').toLowerCase();

	// Create a simple hash from the tag string
	let hash = 0;
	for (let i = 0; i < cleanTag.length; i++) {
		hash = ((hash << 5) - hash) + cleanTag.charCodeAt(i);
		hash = hash & hash; // Convert to 32bit integer
	}

	// Convert hash to positive hex string (6 characters)
	const hexHash = Math.abs(hash).toString(16).padStart(6, '0').slice(0, 6);

	// Use the deterministic gradient function from NDK
	return deterministicPubkeyGradient(hexHash);
}

/**
 * Ensure hashtag has proper # prefix
 * @param tag - Hashtag (with or without # prefix)
 * @returns Hashtag with # prefix
 */
export function formatHashtag(tag: string): string {
	return tag.startsWith('#') ? tag : `#${tag}`;
}

/**
 * Remove # prefix from hashtag
 * @param tag - Hashtag (with or without # prefix)
 * @returns Hashtag without # prefix
 */
export function stripHashtag(tag: string): string {
	return tag.replace(/^#/, '');
}
