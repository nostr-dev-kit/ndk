<!-- @ndk-version: negentropy-sync-progress-compact@0.1.0 -->
<script lang="ts">
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import type { NDKFilter } from '@nostr-dev-kit/ndk';
	import { NegentrogySync } from '../../ui/negentropy-sync';
	import { getNDKFromContext } from '../../utils/ndk-context.svelte.js';
	import { getContext } from 'svelte';
	import { NEGENTROPY_SYNC_CONTEXT_KEY, type NegentropySyncContext } from '../../ui/negentropy-sync/negentropy-sync.context.js';

	interface Props {
		ndk?: NDKSvelte;
		filters: NDKFilter | NDKFilter[];
		relayUrls?: string[];
		class?: string;
	}

	let { ndk: providedNdk, filters, relayUrls, class: className = '' }: Props = $props();

	const ndk = getNDKFromContext(providedNdk);
	let expanded = $state(false);
</script>

<NegentrogySync.Root {ndk} {filters} {relayUrls}>
	{#snippet content()}
		{@const context = getContext<NegentropySyncContext>(NEGENTROPY_SYNC_CONTEXT_KEY)}
		<div
			class="inline-flex items-center gap-2 px-3 py-1.5 bg-card hover:bg-muted rounded-full border transition-all {className}"
			role="button"
			tabindex="0"
			onmouseenter={() => expanded = true}
			onmouseleave={() => expanded = false}
			onfocus={() => expanded = true}
			onblur={() => expanded = false}
		>
			<!-- Status icon -->
			<div class="flex-shrink-0">
				{#if context.syncing}
					<svg class="w-4 h-4 text-blue-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
					</svg>
				{:else}
					<svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
					</svg>
				{/if}
			</div>

			<!-- Percentage -->
			<span class="text-sm font-semibold text-gray-900 dark:text-gray-100 tabular-nums">
				{context.progress}%
			</span>

			<!-- Expanded details -->
			{#if expanded}
				<div class="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400 border-l pl-3 animate-in fade-in slide-in-from-left-2 duration-200">
					<span>{context.completedRelays}/{context.totalRelays} relays</span>
					<span>{context.totalEvents} events</span>
					{#if context.errors.size > 0}
						<span class="text-red-600">{context.errors.size} errors</span>
					{/if}
				</div>
			{/if}
		</div>
	{/snippet}

	{@render content()}
</NegentrogySync.Root>
