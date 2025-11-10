<script lang="ts">
	import type { NDKEvent } from '@nostr-dev-kit/ndk';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import type { Snippet } from 'svelte';
	import { getContext } from 'svelte';
	import { defaultContentRenderer } from '$lib/registry/ui/content-renderer';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { ViewOffIcon } from '@hugeicons/core-free-icons';

	interface Props {
		url: string | string[];
		event?: NDKEvent;
		class?: string;
		children: Snippet<[{ url: string | string[], class?: string }]>;
	}

	let {
		url,
		event,
		class: className = '',
		children
	}: Props = $props();

	// Get NDK from context if available
	const ndk = getContext<NDKSvelte | undefined>('ndk');

	// State for blur/reveal
	let showMedia = $state(false);

	// Check for NSFW content
	const nsfwTag = $derived.by(() => {
		if (!event) return null;
		return event.tags.find(tag =>
			tag[0] === 'content-warning'
		);
	});

	const nsfwReason = $derived(nsfwTag ? (nsfwTag[1] || 'Sensitive content') : null);
	const hasNSFW = $derived(!!nsfwTag);

	// Check if user follows the event author
	const isFollowing = $derived.by(() => {
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

	function handleReveal() {
		showMedia = true;
	}

	function handleKeyPress(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			handleReveal();
		}
	}
</script>

<div class="relative {className}">
	{#if shouldBlur && !showMedia}
		<!-- Blurred overlay -->
		<div class="relative">
			<!-- Blurred media preview -->
			<div class="blur-xl opacity-50">
				{@render children({ url })}
			</div>

			<!-- Overlay with reveal button -->
			<button
				class="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm rounded-lg cursor-pointer transition-all hover:bg-black/70 group"
				onclick={handleReveal}
				onkeypress={handleKeyPress}
				aria-label="Reveal media content"
			>
				<HugeiconsIcon icon={ViewOffIcon} class="w-12 h-12 text-white/80 mb-2 group-hover:scale-110 transition-transform" />
				<span class="text-white font-medium text-lg mb-1">Click to view</span>
				<span class="text-white/70 text-sm px-4 text-center">
					{blurReason}
				</span>
			</button>
		</div>
	{:else}
		<!-- Unblurred media -->
		{@render children({ url, class: className })}
	{/if}
</div>