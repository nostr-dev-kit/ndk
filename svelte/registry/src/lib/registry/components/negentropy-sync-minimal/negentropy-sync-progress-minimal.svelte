<script lang="ts">
	import { NegentrogySync } from '../../../../ui/negentropy-sync';
	import { createNegentropySync } from '../../../../builders/negentropy-sync/index.js';

	interface Props {
		syncBuilder: ReturnType<typeof createNegentropySync>;
		class?: string;
	}

	let { syncBuilder, class: className = '' }: Props = $props();
</script>

<NegentrogySync.Root {syncBuilder}>
	<div data-negentropy-sync-progress-minimal="" class="space-y-2 {className}">
		<div data-negentropy-sync-progress-minimal="" class="flex items-center justify-between text-sm">
			<span class="text-gray-500 dark:text-gray-400 text-xs font-mono">
				<NegentrogySync.Stats direction="horizontal" class="gap-2" />
			</span>
		</div>
		<NegentrogySync.ProgressBar showPercentage />
	</div>
</NegentrogySync.Root>
