<script lang="ts">
	type Props = {
		title: string;
		description?: string;
	};

	let { title, description }: Props = $props();
</script>

<div class="border-t border-b border-border/50 py-12 -mx-8 px-8">
	<h2 class="text-3xl font-bold mb-2">{title}</h2>
	{#if description}
		<p class="text-muted-foreground">{description}</p>
	{/if}
</div>
