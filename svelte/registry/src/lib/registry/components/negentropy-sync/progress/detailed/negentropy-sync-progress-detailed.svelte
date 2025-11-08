<script lang="ts">
	import { NegentrogySync } from '../../../ui/negentropy-sync';
	import { createNegentropySync } from '../../../builders/negentropy-sync/index.js';

	interface Props {
		syncBuilder: ReturnType<typeof createNegentropySync>;
		class?: string;
	}

	let { syncBuilder, class: className = '' }: Props = $props();
</script>

<NegentrogySync.Root {syncBuilder}>
	<div data-negentropy-sync-progress-detailed="" class="space-y-4 p-4 bg-card rounded-lg border {className}">
		<div data-negentropy-sync-progress-detailed="" class="flex items-center justify-between">
			<NegentrogySync.Stats direction="horizontal" />
		</div>

		<div data-negentropy-sync-progress-detailed="" class="space-y-3">
			<NegentrogySync.ProgressBar showPercentage class="h-3" />

			<div data-negentropy-sync-progress-detailed="" class="space-y-2">
				<div data-negentropy-sync-progress-detailed="" class="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
					<span>Relay Status</span>
					<span class="text-gray-500">Individual Progress</span>
				</div>
				<NegentrogySync.RelayStatus showCounts />
			</div>
		</div>
	</div>
</NegentrogySync.Root>
