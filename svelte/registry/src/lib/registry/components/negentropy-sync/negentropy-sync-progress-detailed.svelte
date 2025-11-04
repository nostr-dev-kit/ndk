<!-- @ndk-version: negentropy-sync-progress-detailed@0.1.0 -->
<script lang="ts">
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import type { NDKFilter } from '@nostr-dev-kit/ndk';
	import { NegentrogySync } from '../../ui/negentropy-sync';
	import { getNDKFromContext } from '../../utils/ndk-context.svelte.js';

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
	<div class="space-y-4 p-4 bg-card rounded-lg border {className}">
		<div class="flex items-center justify-between">
			<h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100">Negentropy Sync</h3>
			<NegentrogySync.Stats direction="horizontal" />
		</div>

		<div class="space-y-3">
			<NegentrogySync.ProgressBar showPercentage class="h-3" />

			<div class="space-y-2">
				<div class="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
					<span>Relay Status</span>
					<span class="text-gray-500">Individual Progress</span>
				</div>
				<NegentrogySync.RelayStatus showCounts />
			</div>
		</div>
	</div>
</NegentrogySync.Root>
