<!--
  @component RelayCard.Portrait
  Portrait-style relay card preset (vertical layout with icon on top)

  Ideal for grid layouts and relay discovery displays.

  @example
  ```svelte
  <RelayCard.Portrait {ndk} relayUrl="wss://relay.damus.io" />
  ```
-->
<script lang="ts">
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import { createBookmarkedRelayList } from '@nostr-dev-kit/svelte';
	import { getContext } from 'svelte';
	import { RELAY_CARD_CONTEXT_KEY, type RelayCardContext } from '../relay-card/context.svelte.js';
	import Root from '../relay-card/relay-card-root.svelte';
	import Icon from '../relay-card/relay-card-icon.svelte';
	import Name from '../relay-card/relay-card-name.svelte';
	import Url from '../relay-card/relay-card-url.svelte';
	import Description from '../relay-card/relay-card-description.svelte';
	import BookmarkButton from '../relay-card/relay-card-bookmark-button.svelte';
	import { cn } from '$lib/utils';

	interface Props {
		/** NDK instance */
		ndk: NDKSvelte;

		/** Relay WebSocket URL */
		relayUrl: string;

		/** Card width (default: 360px) */
		width?: string;

		/** Card height (default: 420px) */
		height?: string;

		/** Click handler */
		onclick?: (e: MouseEvent) => void;

		/** Additional CSS classes */
		class?: string;
	}

	let {
		ndk,
		relayUrl,
		width = 'w-[220px]',
		height = 'h-[320px]',
		onclick,
		class: className = ''
	}: Props = $props();

	// Create bookmark state for current user
	const bookmarks = createBookmarkedRelayList(
		() => ({
			authors: [],
			includeCurrentUser: true
		}),
		ndk
	);

	function handleClick(e: MouseEvent) {
		if (onclick) {
			onclick(e);
		} else {
			// Default: open relay URL in new tab
			window.open(relayUrl, '_blank');
		}
	}
</script>

<Root {ndk} {relayUrl}>
	{#snippet cardContent()}
		{@const context = getContext<RelayCardContext>(RELAY_CARD_CONTEXT_KEY)}
		{@const banner = context?.relayInfo.nip11?.banner}
		{@const hasBanner = banner != null && banner !== ''}

	<button
		type="button"
		onclick={handleClick}
		class={cn(
			'group flex flex-col',
			'rounded-2xl',
			'bg-card hover:bg-muted',
			'border border-border',
			'transition-all duration-300',
			'text-left relative',
			'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),inset_0_0_0_1px_rgba(255,255,255,0.06)]',
			'overflow-hidden',
			width,
			height,
			className
		)}
	>

		<!-- Background with Banner or Icon fallback - covers entire card -->
		<div class="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl">
			{#if hasBanner}
				<!-- Banner image as background -->
				<img
					src={banner}
					alt="Relay banner"
					class="absolute inset-0 w-full h-full object-cover"
				/>
				<!-- Gradient overlay for better text readability -->
				<div class="absolute inset-0 bg-gradient-to-b from-card/40 via-card/60 to-card/80"></div>
			{:else}
				<!-- Fallback: Large faded icon as background - centered and covering full height -->
				<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-50 scale-[2.5]">
					<Icon size={200} />
				</div>
				<!-- Gradient overlay for color effect -->
				<div class="absolute inset-0 bg-gradient-to-br from-primary/15 via-primary/5 to-accent/15"></div>
				<!-- Subtle texture overlay -->
				<div class="absolute inset-0 bg-gradient-to-b from-transparent via-card/30 to-card/60"></div>
			{/if}
			<!-- Glassmorphism overlay covering entire card -->
			<div class="absolute inset-0 backdrop-blur-sm"></div>
		</div>

		<!-- Bookmark Button (top-right) -->
		<div class="absolute top-3 right-3 z-10">
			<BookmarkButton {bookmarks} size="sm" />
		</div>

		<!-- Icon -->
		<div class="relative flex items-center justify-center pt-8 pb-4 z-[1]">
			<div class="relative">
				<!-- Glow effect behind icon -->
				<div class="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
				<Icon size={80} class="relative z-[1]" />
			</div>
		</div>

		<!-- Content -->
		<div class="relative z-[1] px-6 pb-6 flex flex-col flex-1 min-h-0 text-center">
			<div class="relative z-[1] flex flex-col flex-1">
				<!-- Name -->
				<Name class="text-lg font-semibold mb-1" />

				<!-- URL -->
				<Url class="text-sm text-muted-foreground mb-3" showProtocol={false} />

				<!-- Description -->
				<Description maxLines={2} class="text-sm leading-relaxed mb-4" />

				<!-- Browse button - always visible, at bottom -->
				<div class="mt-auto border-t border-border/50">
					<div class="flex items-center justify-center gap-1 text-sm text-primary">
						<span>Browse</span>
						<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
						</svg>
					</div>
				</div>
			</div>
		</div>
	</button>
	{/snippet}

	{@render cardContent()}
</Root>
