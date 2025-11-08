<script lang="ts">
	import { DropdownMenu } from 'bits-ui';

	interface Props {
		label?: string;
		children?: import('svelte').Snippet;
		class?: string;
	}

	let { label, children, class: className = '' }: Props = $props();
</script>

<DropdownMenu.Group class="p-2 {className}">
	{#if label}
		<DropdownMenu.GroupHeading class="px-3 py-2 text-[0.6875rem] font-semibold text-muted-foreground uppercase tracking-wide">
			{label}
		</DropdownMenu.GroupHeading>
	{/if}
	<div class="flex flex-col">
		{#if children}
			{@render children()}
		{/if}
	</div>
</DropdownMenu.Group>
