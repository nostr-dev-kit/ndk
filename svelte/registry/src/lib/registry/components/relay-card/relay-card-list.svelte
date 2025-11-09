<script lang="ts">
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import { createBookmarkedRelayList } from '../../builders/relay/bookmarks.svelte.js';
	import Root from '../../ui/relay/relay-root.svelte';
	import Icon from '../../ui/relay/relay-icon.svelte';
	import Name from '../../ui/relay/relay-name.svelte';
	import Url from '../../ui/relay/relay-url.svelte';
	import Description from '../../ui/relay/relay-description.svelte';
	import BookmarkButton from '../../ui/relay/relay-bookmark-button.svelte';
	import { cn } from '../../utils/cn';

	interface Props {
		ndk: NDKSvelte;

		relayUrl: string;

		showDescription?: boolean;

		compact?: boolean;

		onclick?: (e: MouseEvent) => void;

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
		data-relay-card-list=""
		data-compact={compact ? '' : undefined}
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
			<Icon class={compact ? 'w-8 h-8' : 'w-12 h-12'} />
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
			<BookmarkButton {bookmarks} class="w-8 h-8" />
		</div>
	</button>
</Root>
