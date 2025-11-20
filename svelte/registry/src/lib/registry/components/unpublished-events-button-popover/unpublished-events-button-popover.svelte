<script lang="ts">
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import type { NDKEvent } from '@nostr-dev-kit/ndk';
	import type { Snippet } from 'svelte';
	import { Popover } from 'bits-ui';
	import { UnpublishedEvents } from '$lib/registry/ui/unpublished-events';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { CloudUploadIcon } from '@hugeicons/core-free-icons';

	interface ItemData {
		event: NDKEvent;
		relays?: string[];
		lastTryAt?: number;
		retry: () => Promise<void>;
		discard: () => Promise<void>;
	}

	interface Props {
		ndk: NDKSvelte;
		eventPreview: Snippet<[ItemData]>;
		buttonContent?: Snippet;
		emptyState?: Snippet;
		class?: string;
	}

	let { ndk, eventPreview, buttonContent, emptyState, class: className = '' }: Props = $props();

	let isOpen = $state(false);
</script>

<UnpublishedEvents.Root {ndk}>
	<Popover.Root bind:open={isOpen}>
		<Popover.Trigger
			class="relative inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium bg-card text-card-foreground border border-border hover:bg-accent hover:text-accent-foreground transition-colors {className}"
			data-unpublished-events-button=""
		>
			{#if buttonContent}
				{@render buttonContent()}
			{:else}
				<HugeiconsIcon icon={CloudUploadIcon} size={16} />
				<span>Failed Publishes</span>
			{/if}
			<UnpublishedEvents.Badge class="ml-1" />
		</Popover.Trigger>

		<Popover.Content
			class="z-50 w-[400px] max-h-[500px] overflow-y-auto rounded-lg border border-border bg-popover p-4 shadow-md outline-none"
			sideOffset={5}
		>
			<UnpublishedEvents.List class="space-y-3">
				{#snippet emptyState()}
					{#if emptyState}
						{@render emptyState()}
					{:else}
						<div class="text-center py-6 text-muted-foreground text-sm">
							No unpublished events
						</div>
					{/if}
				{/snippet}

				<UnpublishedEvents.Item>
					{#snippet children(itemData: ItemData)}
						{@render eventPreview(itemData)}
					{/snippet}
				</UnpublishedEvents.Item>
			</UnpublishedEvents.List>
		</Popover.Content>
	</Popover.Root>
</UnpublishedEvents.Root>
