<script lang="ts">
	import { DropdownMenu } from 'bits-ui';

	interface Props {
		children?: import('svelte').Snippet;
		class?: string;
		sideOffset?: number;
		align?: 'start' | 'center' | 'end';
	}

	let { children, class: className = '', sideOffset = 8, align = 'end' }: Props = $props();
</script>

<DropdownMenu.Content
	class="bg-card border border-border rounded-lg min-w-[17.5rem] shadow-lg z-[1000] {className}"
	{sideOffset}
	{align}
>
	{#if children}
		{@render children()}
	{/if}
</DropdownMenu.Content>
