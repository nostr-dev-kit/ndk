<script lang="ts">
	import type { Snippet } from 'svelte';
	import { setContext } from 'svelte';
	import type { AnatomyLayer } from './index';

	type Props = {
		title?: string;
		description?: string;
		children: Snippet;
	};

	let { title = 'Anatomy', description = 'Click on any layer to see its details and props', children }: Props = $props();

	let selectedLayer = $state<string | null>(null);

	function selectLayer(layerId: string | null) {
		selectedLayer = layerId;
	}

	setContext('anatomy', {
		get selectedLayer() {
			return selectedLayer;
		},
		selectLayer
	});
</script>

<section class="mb-24">
	<h2 class="text-3xl font-bold mb-4">{title}</h2>
	<p class="text-muted-foreground mb-8">{description}</p>

	<div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
		{@render children()}
	</div>
</section>
