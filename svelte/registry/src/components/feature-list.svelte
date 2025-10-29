<!--
Styled feature list with title/description pairs.
Use for: listing component features, capabilities, or usage notes.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface FeatureItem {
		title: string;
		description: string;
	}

	interface Props {
		items?: FeatureItem[];
		variant?: 'default' | 'compact';
		children?: Snippet;
		class?: string;
	}

	let { items, variant = 'default', children, class: className = '' }: Props = $props();
</script>

<ul class="feature-list feature-list-{variant} {className}">
	{#if items}
		{#each items as item}
			<li>
				<strong>{item.title}:</strong>
				{item.description}
			</li>
		{/each}
	{:else if children}
		{@render children()}
	{/if}
</ul>

<style>
	.feature-list {
		margin: 1rem 0;
		padding-left: 1.5rem;
		line-height: 1.6;
		color: var(--color-muted-foreground);
	}

	.feature-list li {
		margin-bottom: 0.5rem;
	}

	.feature-list li:last-child {
		margin-bottom: 0;
	}

	.feature-list strong {
		color: var(--color-foreground);
		font-weight: 600;
	}

	.feature-list :global(code) {
		background: color-mix(in srgb, var(--color-muted) calc(0.5 * 100%), transparent);
		padding: 0.125rem 0.375rem;
		border-radius: 0.25rem;
		font-size: 0.875em;
		font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
		color: var(--color-primary);
	}

	/* Compact variant - tighter spacing */
	.feature-list-compact {
		line-height: 1.5;
	}

	.feature-list-compact li {
		margin-bottom: 0.375rem;
	}

	.feature-list-compact strong {
		display: inline-block;
		min-width: 120px;
		color: var(--color-primary);
	}
</style>
