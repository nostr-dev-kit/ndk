<!-- @ndk-version: negentropy-sync-progress-compact@0.1.0 -->
<script lang="ts">
	import { NegentrogySync } from '../../ui/negentropy-sync';
	import { Relay } from '../../ui/relay';
	import { createNegentropySync } from '../../builders/negentropy-sync/index.js';
	import { getContext } from 'svelte';
	import { NEGENTROPY_SYNC_CONTEXT_KEY, type NegentropySyncContext } from '../../ui/negentropy-sync/negentropy-sync.context.js';

	interface Props {
		syncBuilder: ReturnType<typeof createNegentropySync>;
		class?: string;
	}

	let { syncBuilder, class: className = '' }: Props = $props();
	let expanded = $state(false);
</script>

<NegentrogySync.Root {syncBuilder}>
	{@const context = getContext<NegentropySyncContext>(NEGENTROPY_SYNC_CONTEXT_KEY)}
	<div
		class="inline-flex items-center gap-2 px-3 py-1.5 bg-card hover:bg-muted rounded-full border transition-all duration-300 {className}"
		role="button"
		tabindex="0"
		onmouseenter={() => expanded = true}
		onmouseleave={() => expanded = false}
		onfocus={() => expanded = true}
		onblur={() => expanded = false}
	>
		<!-- Relay icons avatars -->
		{#if context.relays.length > 0}
			<div class="flex -space-x-2 flex-shrink-0">
				{#each context.relays as relay (relay.url)}
					<Relay.Root relayUrl={relay.url}>
						<Relay.Icon class="w-5 h-5 ring-2 ring-card transition-all duration-200" />
					</Relay.Root>
				{/each}
			</div>
		{/if}

		<!-- Status icon -->
		<div class="flex-shrink-0">
			{#if context.syncing}
				<svg class="w-4 h-4 text-blue-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" ></path>
				</svg>
			{:else}
				<svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" ></path>
				</svg>
			{/if}
		</div>

		<!-- Percentage -->
		<span class="text-sm font-semibold text-gray-900 dark:text-gray-100 tabular-nums transition-colors duration-200">
			{context.progress}%
		</span>

		<!-- Expanded details with smooth transitions -->
		<div
			class="overflow-hidden transition-all duration-300 ease-in-out border-l {expanded ? 'max-w-xs opacity-100 pl-3 ml-2' : 'max-w-0 opacity-0 pl-0 ml-0 border-transparent'}"
		>
			<div class="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
				<span>{context.totalEvents} events</span>
				{#if context.errors.size > 0}
					<span class="text-red-600">{context.errors.size} errors</span>
				{/if}
			</div>
		</div>
	</div>
</NegentrogySync.Root>
