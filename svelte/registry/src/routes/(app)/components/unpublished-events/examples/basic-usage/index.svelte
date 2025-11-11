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
	import type { NDKEvent } from '@nostr-dev-kit/ndk';
	import { UnpublishedEventsButtonPopover } from '$lib/registry/components/unpublished-events-button-popover';
	import { NDKKind } from '@nostr-dev-kit/ndk';

	interface Props {
		ndk: NDKSvelte;
	}

	let { ndk }: Props = $props();

	let retrying = $state<Set<string>>(new Set());

	async function handleRetry(eventId: string, retryFn: () => Promise<void>) {
		retrying.add(eventId);
		retrying = retrying;

		try {
			await retryFn();
		} catch (error) {
			console.error('Retry failed:', error);
		} finally {
			retrying.delete(eventId);
			retrying = retrying;
		}
	}

	function getKindName(kind: number): string {
		const kindNames: Record<number, string> = {
			[NDKKind.Text]: 'Note',
			[NDKKind.Metadata]: 'Profile',
			[NDKKind.Contacts]: 'Contacts',
			[NDKKind.Repost]: 'Repost',
			[NDKKind.Reaction]: 'Reaction',
			[NDKKind.Zap]: 'Zap'
		};
		return kindNames[kind] || `Kind ${kind}`;
	}
</script>

<UnpublishedEventsButtonPopover {ndk}>
	{#snippet eventPreview({ event, relays, lastTryAt, retry, discard })}
		<div class="border border-border rounded-lg p-3 space-y-2 bg-card">
			<div class="flex items-start justify-between gap-2">
				<div class="flex-1 min-w-0">
					<div class="text-sm font-medium text-card-foreground">
						{getKindName(event.kind!)}
					</div>
					{#if event.content}
						<div class="text-xs text-muted-foreground truncate mt-1">
							{event.content.slice(0, 100)}
						</div>
					{/if}
				</div>
			</div>

			{#if relays}
				<div class="text-xs text-muted-foreground">
					Failed to publish to {relays.length} relay{relays.length !== 1 ? 's' : ''}
				</div>
			{/if}

			{#if lastTryAt}
				<div class="text-xs text-muted-foreground">
					Last attempt: {new Date(lastTryAt).toLocaleString()}
				</div>
			{/if}

			<div class="flex items-center gap-2 pt-2 border-t border-border">
				<button
					onclick={() => handleRetry(event.id!, retry)}
					disabled={retrying.has(event.id!)}
					class="flex-1 text-xs font-medium px-3 py-1.5 rounded bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
				>
					{retrying.has(event.id!) ? 'Retrying...' : 'Retry'}
				</button>
				<button
					onclick={() => discard()}
					class="flex-1 text-xs font-medium px-3 py-1.5 rounded bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
				>
					Discard
				</button>
			</div>
		</div>
	{/snippet}
</UnpublishedEventsButtonPopover>
