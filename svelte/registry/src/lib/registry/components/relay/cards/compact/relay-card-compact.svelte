<script lang="ts">
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import { createBookmarkedRelayList } from '$lib/registry/builders/relay/bookmarks.svelte.js';
	import Root from '../../../ui/relay/relay-root.svelte';
	import Icon from '../../../ui/relay/relay-icon.svelte';
	import Name from '../../../ui/relay/relay-name.svelte';
	import BookmarkButton from '../../../ui/relay/relay-bookmark-button.svelte';
	import { cn } from '$lib/registry/utils/cn';

	interface Props {
		ndk: NDKSvelte;

		relayUrl: string;

		size?: string;

		onclick?: (e: MouseEvent) => void;

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
		data-relay-card-compact=""
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
			<BookmarkButton {bookmarks} class="w-6 h-6" />
		</div>

		<!-- Icon -->
		<Icon class="w-12 h-12" />

		<!-- Name -->
		<Name class="text-sm font-medium line-clamp-2" />
	</button>
</Root>
