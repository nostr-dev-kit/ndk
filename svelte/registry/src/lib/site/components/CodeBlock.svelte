<script lang="ts">
	import { highlightCode } from '$lib/site/utils/highlight';

	interface Props {
		code: string;
		lang?: string;
		class?: string;
	}

	let { code, lang = 'typescript', class: className = '' }: Props = $props();

	let highlightedCode = $state<string>('');
	let isLoading = $state(true);

	$effect(() => {
		(async () => {
			const result = await highlightCode(code, lang);
			highlightedCode = result.html;
			isLoading = result.isLoading;
		})();
	});
</script>

{#if isLoading}
	<div class="flex items-center justify-center gap-2 p-8 {className}">
		<div class="w-4 h-4 border-2 border-muted border-t-primary rounded-full animate-spin"></div>
		<span class="text-xs text-muted-foreground">Loading...</span>
	</div>
{:else}
	<div class="code-block {className}">
		{@html highlightedCode}
	</div>
{/if}

<style>
	.code-block :global(pre) {
		margin: 0;
		padding: 1.5rem;
		background: transparent;
		border: none;
		overflow-x: auto;
	}

	.code-block :global(code) {
		font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, monospace;
		font-size: 0.875rem;
		line-height: 1.7;
		display: block;
	}

	/* Apply Shiki's color variables based on theme */
	@media (prefers-color-scheme: light) {
		.code-block :global(.shiki),
		.code-block :global(.shiki span) {
			color: var(--shiki-light);
			background-color: var(--shiki-light-bg);
		}
	}

	@media (prefers-color-scheme: dark) {
		.code-block :global(.shiki),
		.code-block :global(.shiki span) {
			color: var(--shiki-dark);
			background-color: var(--shiki-dark-bg);
		}
	}
</style>
