<!--
Responsive grid layout for multiple CodePreview or example components.
Use for: showcasing multiple component variations side by side.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		columns?: number;
		gap?: 'sm' | 'md' | 'lg';
		children: Snippet;
		class?: string;
	}

	let { columns = 300, gap = 'md', children, class: className = '' }: Props = $props();

	const gapSizes = {
		sm: '1rem',
		md: '2rem',
		lg: '3rem'
	};
</script>

<div
	class="example-grid {className}"
	style="grid-template-columns: repeat(auto-fit, minmax({columns}px, 1fr)); gap: {gapSizes[gap]};"
>
	{@render children()}
</div>

<style>
	.example-grid {
		display: grid;
		width: 100%;
	}

	/* Ensure grid items don't overflow */
	.example-grid > :global(*) {
		min-width: 0;
	}

	/* Responsive adjustments */
	@media (max-width: 640px) {
		.example-grid {
			grid-template-columns: 1fr !important;
		}
	}
</style>
