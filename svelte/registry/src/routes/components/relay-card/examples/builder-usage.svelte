<script lang="ts">
	import { RelayCard } from '$lib/registry/components/relay-card';
	import { createBookmarkedRelayList } from '@nostr-dev-kit/svelte';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';

	interface Props {
		ndk: NDKSvelte;
	}

	let { ndk }: Props = $props();

	// Create bookmarked relay list for user's follows
	const bookmarks = createBookmarkedRelayList(
		() => ({
			authors: ndk.$follows
		}),
		ndk
	);

	// Get top 5 most bookmarked relays
	const topRelays = $derived(bookmarks.relays.slice(0, 5));
</script>

<div class="space-y-3">
	<h4 class="text-sm font-semibold text-muted-foreground">
		Top {topRelays.length} Relays from Follows
	</h4>

	{#if topRelays.length === 0}
		<div class="text-sm text-muted-foreground p-4 bg-muted rounded-lg">
			No bookmarked relays found. Follow some users or bookmark relays to see them here.
		</div>
	{:else}
		<div class="space-y-2">
			{#each topRelays as relay}
				<RelayCard.Root {ndk} relayUrl={relay.url}>
					<div class="flex items-center gap-3 p-3 bg-card border border-border rounded-lg">
						<RelayCard.Icon size={40} />
						<div class="flex-1 min-w-0">
							<RelayCard.Name class="font-medium truncate" />
							<RelayCard.Url class="text-sm text-muted-foreground truncate" />
						</div>
						<div class="text-xs text-muted-foreground">
							{relay.count} {relay.count === 1 ? 'follow' : 'follows'}
						</div>
					</div>
				</RelayCard.Root>
			{/each}
		</div>
	{/if}
</div>
