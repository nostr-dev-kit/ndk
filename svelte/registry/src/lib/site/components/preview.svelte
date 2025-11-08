<!--
Preview component for displaying interactive component examples with code.
Used in component documentation pages to show both the visual output and source code.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import CodeSnippet from './code-snippet.svelte';

	interface Props {
		title?: string;
		code?: string;
		children: Snippet;
		class?: string;
		previewAreaClass?: string;
	}

	let { title, code, children, class: className = '', previewAreaClass = '' }: Props = $props();
</script>

<section class="flex flex-col gap-4 {className}">
	<div class="flex flex-col w-full border border-border rounded-lg">
		{#if title}
			<h3 class="text-xl font-semibold text-foreground m-0 p-4">{title}</h3>
		{/if}

		<div class="min-h-[433px] flex flex-col items-center bg-zinc-50 dark:bg-neutral-900/50 justify-center max-h-[600px] overflow-y-auto border-y border-border {previewAreaClass}">
			<div class="p-8 flex justify-center items-center">
				{@render children()}
			</div>
		</div>
		{#if code}
			<CodeSnippet {code} lang="svelte" class="rounded-t-none border-none" />
		{/if}
	</div>
</section>
