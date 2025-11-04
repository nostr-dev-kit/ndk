<!-- @ndk-version: negentropy-sync-progress-minimal@0.1.0 -->
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
	<div class="space-y-2 {className}">
		<div class="flex items-center justify-between text-sm">
			<span class="text-gray-700 dark:text-gray-300">Sync Progress</span>
			<span class="text-gray-500 dark:text-gray-400 text-xs font-mono">
				<NegentrogySync.Stats direction="horizontal" class="gap-2" />
			</span>
		</div>
		<NegentrogySync.ProgressBar showPercentage />
	</div>
</NegentrogySync.Root>
