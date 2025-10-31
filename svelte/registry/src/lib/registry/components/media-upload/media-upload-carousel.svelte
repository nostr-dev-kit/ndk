<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		class?: string;
		itemClass?: string;
	}

	let {
		children,
		class: className = 'flex gap-4 overflow-x-auto',
		itemClass
	}: Props = $props();
</script>

<div class={className}>
	{@render children()}
</div>
