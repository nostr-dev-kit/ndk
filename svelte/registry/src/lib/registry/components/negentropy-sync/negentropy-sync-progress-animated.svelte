<!-- @ndk-version: negentropy-sync-progress-animated@0.1.0 -->
<script lang="ts">
	import { NegentrogySync } from '../../ui/negentropy-sync';
	import { createNegentropySync } from '../../builders/negentropy-sync/index.js';
	import { getContext } from 'svelte';
	import { NEGENTROPY_SYNC_CONTEXT_KEY, type NegentropySyncContext } from '../../ui/negentropy-sync/negentropy-sync.context.js';

	interface Props {
		syncBuilder: ReturnType<typeof createNegentropySync>;
		class?: string;
	}

	let { syncBuilder, class: className = '' }: Props = $props();
</script>

<NegentrogySync.Root {syncBuilder}>
	{@const context = getContext<NegentropySyncContext>(NEGENTROPY_SYNC_CONTEXT_KEY)}
		<div data-negentropy-sync-progress-animated="" class="relative overflow-hidden space-y-3 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-blue-200 dark:border-gray-700 shadow-lg {className}">
			<!-- Animated background when syncing -->
			{#if context.syncing}
				<div data-negentropy-sync-progress-animated="" class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite]" style="animation: shimmer 2s infinite linear;"></div>
			{/if}

			<div data-negentropy-sync-progress-animated="" class="relative z-10 space-y-3">
				<div data-negentropy-sync-progress-animated="" class="flex items-center justify-between">
					<div data-negentropy-sync-progress-animated="" class="flex items-center gap-2">
						{#if context.syncing}
							<div data-negentropy-sync-progress-animated="" class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
						{:else}
							<div data-negentropy-sync-progress-animated="" class="w-2 h-2 bg-green-500 rounded-full"></div>
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

				<div data-negentropy-sync-progress-animated="" class="flex items-center justify-between text-xs">
					<div data-negentropy-sync-progress-animated="" class="flex gap-4">
						<div data-negentropy-sync-progress-animated="" class="flex flex-col">
							<span class="text-gray-600 dark:text-gray-400">Relays</span>
							<span class="font-semibold text-gray-900 dark:text-gray-100">
								{context.completedRelays}/{context.totalRelays}
							</span>
						</div>
						<div data-negentropy-sync-progress-animated="" class="flex flex-col">
							<span class="text-gray-600 dark:text-gray-400">Events</span>
							<span class="font-semibold text-gray-900 dark:text-gray-100">
								{context.totalEvents.toLocaleString()}
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
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
