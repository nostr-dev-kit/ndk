<!-- @ndk-version: relay-card-list@0.1.0 -->
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
	import Root from '../components/relay/relay-root.svelte';
	import Icon from '../components/relay/relay-icon.svelte';
	import Name from '../components/relay/relay-name.svelte';
	import Url from '../components/relay/relay-url.svelte';
	import Description from '../components/relay/relay-description.svelte';
	import BookmarkButton from '../components/relay/relay-bookmark-button.svelte';
	import { cn } from '../../utils.js';

	interface Props {
		/** NDK instance */
		ndk: NDKSvelte;

		/** Relay WebSocket URL */
		relayUrl: string;

		/** Show description */
		showDescription?: boolean;

		/** Compact variant - smaller icon, no URL */
		compact?: boolean;

		/** Click handler */
		onclick?: (e: MouseEvent) => void;

		/** Additional CSS classes */
		class?: string;
	}

	let {
		ndk,
		relayUrl,
		showDescription = true,
		compact = false,
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
			'relay-card-list',
			'group flex items-center w-full',
			'hover:bg-muted',
			'border-b border-border last:border-b-0',
			'transition-all duration-200',
			'text-left',
			compact ? 'gap-3 p-2' : 'gap-4 p-4',
			className
		)}
	>
		<!-- Icon -->
		<div class="flex-shrink-0">
			<Icon size={compact ? 32 : 48} />
		</div>

		<!-- Content -->
		<div class="flex-1 min-w-0">
			<!-- Name -->
			<div class={cn('mb-0.5', !compact && 'mb-1')}>
				<Name class={cn('font-semibold truncate', compact ? 'text-sm' : 'text-base')} />
			</div>

			{#if !compact}
				<Url class="text-xs text-muted-foreground mb-0.5" showProtocol={false} />
			{/if}

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
