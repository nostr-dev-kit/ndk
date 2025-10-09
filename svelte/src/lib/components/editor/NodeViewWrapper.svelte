<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		as = 'div',
		class: className = '',
		'data-type': dataType,
		children
	}: {
		as?: string;
		class?: string;
		'data-type'?: string;
		children?: Snippet;
	} = $props();
</script>

<svelte:element this={as} class={className} data-type={dataType} data-node-view-wrapper="">
	{#if children}
		{@render children()}
	{/if}
</svelte:element>
