<script lang="ts">
	import type { NDKEvent } from '@nostr-dev-kit/ndk';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import { EventCard } from '../event-card';

	interface Props {
		ndk: NDKSvelte;
		event: NDKEvent;
	}

	let { ndk, event }: Props = $props();

	// NIP-31: Extract alt tag
	let altTag = $derived(event.tagValue('alt'));

	// Get content (first 200 chars if no alt tag)
	let displayContent = $derived.by(() => {
		if (altTag) return altTag;
		if (!event.content) return '';
		return event.content.length > 200
			? event.content.substring(0, 200) + '...'
			: event.content;
	});
</script>

<div
	data-fallback-event-basic=""
	class="border border-border rounded-lg bg-card p-4"
>
	<EventCard.Root {ndk} {event}>
		<!-- Header with kind badge -->
		<div class="flex items-center gap-2 mb-3">
			<span class="px-3 py-1 bg-primary text-primary-foreground rounded-full text-xs font-semibold">
				Kind {event.kind}
			</span>
		</div>

		<!-- Content: Alt tag or truncated content -->
		{#if displayContent}
			<div class="text-foreground text-sm leading-relaxed mb-3 break-words">
				{displayContent}
			</div>
		{/if}

		<!-- Event Author & Timestamp -->
		<EventCard.Header
			variant="compact"
			avatarSize="sm"
			showTimestamp={true}
		/>
	</EventCard.Root>
</div>
