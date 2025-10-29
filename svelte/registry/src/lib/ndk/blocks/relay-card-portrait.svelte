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

		/** Card width (default: 280px) */
		width?: string;

		/** Card height (default: 360px) */
		height?: string;

		/** Click handler */
		onclick?: (e: MouseEvent) => void;

		/** Additional CSS classes */
		class?: string;
	}

	let {
		ndk,
		relayUrl,
		width = 'w-[280px]',
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
	<button
		type="button"
		onclick={handleClick}
		class={cn(
			'relay-card-portrait',
			'group flex flex-col',
			'rounded-2xl overflow-hidden',
			'bg-card hover:bg-muted',
			'border border-border',
			'transition-all duration-300',
			'hover:scale-[1.02] hover:shadow-lg',
			'text-left relative',
			width,
			height,
			className
		)}
	>
		<!-- Background Icon with Gradient - covers entire card -->
		<div class="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl">
			<!-- Large faded icon as background - centered and covering full height -->
			<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-50 scale-[2.5]">
				<Icon size={200} />
			</div>
			<!-- Gradient overlay for color effect -->
			<div class="absolute inset-0 bg-gradient-to-br from-primary/15 via-primary/5 to-accent/15"></div>
			<!-- Subtle texture overlay -->
			<div class="absolute inset-0 bg-gradient-to-b from-transparent via-card/30 to-card/60"></div>
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
		<div class="relative z-[1] px-4 pb-4 flex flex-col flex-1 min-h-0 text-center">
			<div class="relative z-[1]">
				<!-- Name -->
				<Name class="text-base font-semibold mb-1" />

				<!-- URL -->
				<Url class="text-xs text-muted-foreground mb-3" showProtocol={false} />

				<!-- Description -->
				<Description maxLines={3} class="text-xs leading-relaxed" />

				<!-- Browse indicator -->
				<div class="mt-3 pt-3 flex items-center justify-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
					<span>Browse</span>
					<svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
					</svg>
				</div>
			</div>
		</div>
	</button>
</Root>
