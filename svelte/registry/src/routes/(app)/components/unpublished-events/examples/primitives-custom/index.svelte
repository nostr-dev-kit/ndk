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
	import { UnpublishedEvents } from '$lib/registry/ui/unpublished-events';

	interface Props {
		ndk: NDKSvelte;
	}

	let { ndk }: Props = $props();
</script>

<UnpublishedEvents.Root {ndk} class="p-6 border border-border rounded-lg bg-card">
	<div class="flex items-center justify-between mb-4">
		<div class="flex items-center gap-3">
			<h3 class="text-lg font-semibold text-card-foreground">Failed Publishes</h3>
			<UnpublishedEvents.Badge showZero />
		</div>
	</div>

	<UnpublishedEvents.List class="space-y-3">
		{#snippet emptyState()}
			<div class="text-center py-8 text-muted-foreground">
				<p class="text-sm">All events published successfully!</p>
			</div>
		{/snippet}

		<UnpublishedEvents.Item class="space-y-3">
			{#snippet children({ event, relays, lastTryAt, retry, discard })}
				<div class="border border-border rounded-lg overflow-hidden">
					<!-- Header -->
					<div class="bg-muted px-4 py-2 flex items-center justify-between">
						<div class="text-sm font-medium text-card-foreground">
							Kind {event.kind}
						</div>
						<UnpublishedEvents.Badge class="ml-auto" />
					</div>

					<!-- Content -->
					<div class="p-4 space-y-3">
						{#if event.content}
							<div class="text-sm text-muted-foreground">
								{event.content.slice(0, 150)}
								{#if event.content.length > 150}...{/if}
							</div>
						{/if}

						<div class="flex items-center gap-4 text-xs text-muted-foreground">
							{#if relays}
								<span>{relays.length} relay{relays.length !== 1 ? 's' : ''}</span>
							{/if}
							{#if lastTryAt}
								<span>
									{new Date(lastTryAt).toLocaleTimeString()}
								</span>
							{/if}
						</div>

						<!-- Actions -->
						<div class="flex items-center gap-2 pt-2 border-t border-border">
							<button
								onclick={() => retry()}
								class="flex-1 text-sm font-medium px-4 py-2 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
							>
								Retry Publish
							</button>
							<button
								onclick={() => discard()}
								class="px-4 py-2 text-sm font-medium rounded border border-border hover:bg-muted transition-colors"
							>
								Discard
							</button>
						</div>
					</div>
				</div>
			{/snippet}
		</UnpublishedEvents.Item>
	</UnpublishedEvents.List>
</UnpublishedEvents.Root>
