<!-- @ndk-version: negentropy-sync-progress-animated@0.1.0 -->
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
</script>

<NegentrogySync.Root {ndk} {filters} {relayUrls}>
	{#snippet content()}
		{@const context = getContext<NegentropySyncContext>(NEGENTROPY_SYNC_CONTEXT_KEY)}
		<div class="relative overflow-hidden space-y-3 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-blue-200 dark:border-gray-700 shadow-lg {className}">
			<!-- Animated background when syncing -->
			{#if context.syncing}
				<div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite]" style="animation: shimmer 2s infinite linear;" />
			{/if}

			<div class="relative z-10 space-y-3">
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-2">
						{#if context.syncing}
							<div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
						{:else}
							<div class="w-2 h-2 bg-green-500 rounded-full" />
						{/if}
						<span class="text-sm font-semibold text-gray-900 dark:text-gray-100">
							{context.syncing ? 'Syncing with relays...' : 'Sync Complete!'}
						</span>
					</div>
					<span class="text-2xl font-bold text-blue-600 dark:text-blue-400 tabular-nums">
						{context.progress}%
					</span>
				</div>

				<NegentrogySync.ProgressBar
					class="h-4 shadow-inner"
					barClass="shadow-lg {context.syncing ? 'animate-pulse' : ''}"
				/>

				<div class="flex items-center justify-between text-xs">
					<div class="flex gap-4">
						<div class="flex flex-col">
							<span class="text-gray-600 dark:text-gray-400">Relays</span>
							<span class="font-semibold text-gray-900 dark:text-gray-100">
								{context.completedRelays}/{context.totalRelays}
							</span>
						</div>
						<div class="flex flex-col">
							<span class="text-gray-600 dark:text-gray-400">Events</span>
							<span class="font-semibold text-gray-900 dark:text-gray-100">
								{context.totalEvents.toLocaleString()}
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	{/snippet}

	{@render content()}
</NegentrogySync.Root>

<style>
	@keyframes shimmer {
		0% {
			transform: translateX(-100%);
		}
		100% {
			transform: translateX(100%);
		}
	}
</style>
