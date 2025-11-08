<script lang="ts">
	import { getContext } from 'svelte';
	import type { AnatomyLayer } from './index';

	type Props = {
		layers: Record<string, AnatomyLayer>;
		emptyMessage?: string;
	};

	let { layers, emptyMessage = 'Hover and click on a layer to see its details' }: Props = $props();

	const anatomyContext = getContext<{
		selectedLayer: string | null;
		selectLayer: (id: string | null) => void;
	}>('anatomy');

	const currentLayer = $derived(anatomyContext.selectedLayer ? layers[anatomyContext.selectedLayer] : null);
</script>

<div class="flex flex-col justify-start">
	{#if currentLayer}
		<div class="animate-in fade-in duration-200">
			<h3 class="font-mono text-xl font-bold mb-3">{currentLayer.label}</h3>
			<p class="text-muted-foreground mb-4">
				{currentLayer.description}
			</p>
			<div class="flex gap-2 flex-wrap">
				{#each currentLayer.props as prop (prop)}
					<code class="bg-muted px-2 py-1 rounded text-sm">{prop}</code>
				{/each}
			</div>
		</div>
	{:else}
		<div class="text-muted-foreground text-sm">
			{emptyMessage}
		</div>
	{/if}
</div>
