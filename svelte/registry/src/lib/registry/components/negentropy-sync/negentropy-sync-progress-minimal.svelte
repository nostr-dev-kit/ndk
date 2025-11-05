<!-- @ndk-version: negentropy-sync-progress-minimal@0.1.0 -->
<script lang="ts">
	import { NegentrogySync } from '../../ui/negentropy-sync';
	import { createNegentropySync } from '../../builders/negentropy-sync/index.js';

	interface Props {
		syncBuilder: ReturnType<typeof createNegentropySync>;
		class?: string;
	}

	let { syncBuilder, class: className = '' }: Props = $props();
</script>

<NegentrogySync.Root {syncBuilder}>
	<div class="space-y-2 {className}">
		<div class="flex items-center justify-between text-sm">
			<span class="text-gray-500 dark:text-gray-400 text-xs font-mono">
				<NegentrogySync.Stats direction="horizontal" class="gap-2" />
			</span>
		</div>
		<NegentrogySync.ProgressBar showPercentage />
	</div>
</NegentrogySync.Root>
