<script lang="ts">
	import type { Snippet } from 'svelte';
	import { setContext } from 'svelte';
	import type { AnatomyLayer } from './index';

	type Props = {
		children: Snippet;
	};

	let { children }: Props = $props();

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
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
		{@render children()}
	</div>
</section>
