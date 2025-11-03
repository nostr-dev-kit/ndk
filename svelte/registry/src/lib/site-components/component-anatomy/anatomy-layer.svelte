<script lang="ts">
	import type { Snippet } from 'svelte';
	import { getContext } from 'svelte';

	type Props = {
		id: string;
		label: string;
		children: Snippet;
		class?: string;
		absolute?: boolean;
	};

	let { id, label, children, class: className = '', absolute = true }: Props = $props();

	const { selectedLayer, selectLayer } = getContext<{
		selectedLayer: string | null;
		selectLayer: (id: string | null) => void;
	}>('anatomy');

	function toggleLayer() {
		selectLayer(selectedLayer === id ? null : id);
	}

	const isSelected = $derived(selectedLayer === id);
</script>

<div class="relative {className}">
	{@render children()}
	<button
		type="button"
		class="group {absolute ? 'absolute' : ''} inset-0 -m-1 border-2 border-dashed border-primary/60 rounded transition-all cursor-pointer {isSelected
			? 'bg-primary/20 border-primary'
			: 'hover:bg-primary/5'}"
		onclick={toggleLayer}
	>
		<span
			class="absolute -bottom-7 right-1 bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10"
		>
			{label}
		</span>
	</button>
</div>
