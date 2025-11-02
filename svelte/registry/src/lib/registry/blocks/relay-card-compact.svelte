<!-- @ndk-version: relay-card-compact@0.1.0 -->
<!--
  @component RelayCard.Compact
  Compact relay card preset (small square card with icon and name)

  Ideal for relay grids and compact displays where space is limited.

  @example
  ```svelte
  <RelayCard.Compact {ndk} relayUrl="wss://relay.damus.io" />
  ```
-->
<script lang="ts">
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import { createBookmarkedRelayList } from '@nostr-dev-kit/svelte';
	import Root from '../components/relay/relay-root.svelte';
	import Icon from '../components/relay/relay-icon.svelte';
	import Name from '../components/relay/relay-name.svelte';
	import BookmarkButton from '../components/relay/relay-bookmark-button.svelte';
	import { cn } from '../../utils.js';

	interface Props {
		/** NDK instance */
		ndk: NDKSvelte;

		/** Relay WebSocket URL */
		relayUrl: string;

		/** Card size (default: 160px square) */
		size?: string;

		/** Click handler */
		onclick?: (e: MouseEvent) => void;

		/** Additional CSS classes */
		class?: string;
	}

	let {
		ndk,
		relayUrl,
		size = 'w-[160px] h-[160px]',
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
		}
	}
</script>

<Root {ndk} {relayUrl}>
	<button
		type="button"
		onclick={handleClick}
		class={cn(
			'relay-card-compact',
			'group flex flex-col items-center justify-center gap-2',
			'rounded-xl overflow-hidden',
			'bg-card hover:bg-muted',
			'border border-border',
			'transition-all duration-200',
			'hover:scale-105 hover:shadow-md',
			'text-center relative p-4',
			size,
			className
		)}
	>
		<!-- Bookmark Button (top-right) -->
		<div class="absolute top-2 right-2 z-10">
			<BookmarkButton {bookmarks} size="sm" />
		</div>

		<!-- Icon -->
		<Icon size={48} />

		<!-- Name -->
		<Name class="text-sm font-medium line-clamp-2" />
	</button>
</Root>
