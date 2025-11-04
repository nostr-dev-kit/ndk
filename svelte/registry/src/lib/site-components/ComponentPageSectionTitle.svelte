<script lang="ts">
	import type { Snippet } from "svelte";

	type Props = {
		title: string;
		description?: string;
		tabs?: Snippet;
		children?: Snippet;
	};

	let { title, description, tabs, children }: Props = $props();
</script>

<div class="border-t border-b border-border -mx-8 px-8">
	<div class="py-12">
		<h2 class="text-3xl font-bold mb-2">{title}</h2>
		{#if description}
			<p class="text-muted-foreground">{description}</p>
		{/if}
	</div>
	{#if tabs}
		<div class="pt-8 flex items-center justify-between border-b border-primary">
			{@render tabs()}
		</div>
	{/if}
	{#if children}
		{@render children()}
	{/if}
</div>
