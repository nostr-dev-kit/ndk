<!--
  @component RelayCard.List
  List-style relay card preset (horizontal layout)

  Ideal for relay lists and feeds. Compact horizontal design perfect for stacking.

  @example
  ```svelte
  <RelayCard.List {ndk} relayUrl="wss://relay.damus.io" />
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

		/** Show description */
		showDescription?: boolean;

		/** Click handler */
		onclick?: (e: MouseEvent) => void;

		/** Additional CSS classes */
		class?: string;
	}

	let {
		ndk,
		relayUrl,
		showDescription = true,
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
			'relay-card-list',
			'group flex items-center gap-4 w-full',
			'p-4 rounded-lg',
			'bg-card hover:bg-muted',
			'border-b border-border last:border-b-0',
			'transition-all duration-200',
			'hover:shadow-sm',
			'text-left',
			className
		)}
	>
		<!-- Icon -->
		<div class="flex-shrink-0">
			<Icon size={48} />
		</div>

		<!-- Content -->
		<div class="flex-1 min-w-0">
			<!-- Name & URL -->
			<div class="flex items-center gap-2 mb-1">
				<Name class="text-base font-semibold truncate" />
				<svg
					width="14"
					height="14"
					class="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
					/>
				</svg>
			</div>

			<Url class="text-xs text-muted-foreground mb-1" showProtocol={false} />

			{#if showDescription}
				<Description maxLines={2} class="text-xs text-muted-foreground leading-relaxed" />
			{/if}
		</div>

		<!-- Actions -->
		<div class="flex-shrink-0">
			<BookmarkButton {bookmarks} size="md" />
		</div>
	</button>
</Root>
