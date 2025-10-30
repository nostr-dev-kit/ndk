<script lang="ts">
	import { EventCard, ReactionAction } from '$lib/ndk/event-card';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import type { NDKEvent } from '@nostr-dev-kit/ndk';

	interface Props {
		ndk: NDKSvelte;
		event: NDKEvent;
	}

	let { ndk, event }: Props = $props();
</script>

<EventCard.Root {ndk} {event} class="border rounded-lg p-4">
	<EventCard.Header variant="full" showAvatar={true} showTimestamp={true} avatarSize="md" />

	<EventCard.Content truncate={300} />

	<EventCard.Actions>
		<ReactionAction emoji="+" />
		<ReactionAction emoji="🔥" />
		<ReactionAction emoji="💯" />
	</EventCard.Actions>
</EventCard.Root>
