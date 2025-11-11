<!--
  IMPORTANT: Keep this file in sync with index.txt

  Rules for maintaining sync between index.svelte and index.txt:
  1. Both files must demonstrate the SAME functionality
  2. index.svelte = Full implementation (with TypeScript interfaces, all imports, complete styling)
  3. index.txt = Simplified documentation version with these changes:
     - Remove TypeScript interface definitions
     - Use inline prop destructuring: let { ndk } = $props();
     - Keep only essential imports (remove type imports unless needed)
     - Keep inline classes (class="...") but remove <style> blocks
     - Focus on showing component API usage, not implementation details
     - Keep the core component usage identical between both files

  When you modify this file, you MUST update index.txt to reflect the same changes
  following the simplification rules above.
-->

<script lang="ts">
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import { createUnpublishedEvents } from '$lib/registry/builders/unpublished-events/index.svelte.js';

	interface Props {
		ndk: NDKSvelte;
	}

	let { ndk }: Props = $props();

	const unpublishedState = createUnpublishedEvents(ndk);
</script>

<div class="space-y-4 p-6 border border-border rounded-lg bg-card">
	<div class="space-y-2">
		<h3 class="text-lg font-semibold text-card-foreground">Unpublished Events</h3>
		<p class="text-sm text-muted-foreground">
			Total: {unpublishedState.events.length}
		</p>
	</div>

	<div class="space-y-2">
		{#each unpublishedState.events as entry (entry.event.id)}
			<div class="p-3 border border-border rounded bg-muted/50">
				<div class="flex items-start justify-between gap-4">
					<div class="flex-1 min-w-0">
						<div class="text-sm font-medium">Kind {entry.event.kind}</div>
						{#if entry.event.content}
							<div class="text-xs text-muted-foreground truncate mt-1">
								{entry.event.content.slice(0, 80)}
							</div>
						{/if}
						{#if entry.relays}
							<div class="text-xs text-muted-foreground mt-1">
								{entry.relays.length} relay{entry.relays.length !== 1 ? 's' : ''}
							</div>
						{/if}
					</div>
					<div class="flex items-center gap-2">
						<button
							onclick={() => unpublishedState.retry(entry.event)}
							class="text-xs px-2 py-1 rounded bg-primary text-primary-foreground hover:bg-primary/90"
						>
							Retry
						</button>
						<button
							onclick={() => unpublishedState.discard(entry.event.id!)}
							class="text-xs px-2 py-1 rounded bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							Discard
						</button>
					</div>
				</div>
			</div>
		{:else}
			<div class="text-center py-6 text-muted-foreground text-sm">
				No unpublished events
			</div>
		{/each}
	</div>
</div>
