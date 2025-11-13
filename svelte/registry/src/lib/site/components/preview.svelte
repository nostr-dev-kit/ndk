<!--
Preview component for displaying interactive component examples with code.
Used in component documentation pages to show both the visual output and source code.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import CodeSnippet from './code-snippet.svelte';
    import { cn } from '$lib/registry/utils/cn';

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
	<div class="flex flex-col w-full rounded-lg divide-y divide-border border border-border overflow-clip">
		{#if title}
			<h3 class="text-xl font-semibold text-foreground m-0 p-4">{title}</h3>
		{/if}

		<div class={cn(
			"min-h-[300px] md:min-h-[433px] flex flex-col items-center justify-center max-h-[400px] md:max-h-[600px] overflow-y-auto",
			"bg-linear-to-r from-zinc-50 to-zinc-100 dark:from-neutral-900 dark:to-neutral-900/50",
			previewAreaClass
		)}>
			<div class="m-4 md:m-8 flex justify-center items-center shadow-xl">
				{@render children()}
			</div>
		</div>
		{#if code}
			<CodeSnippet {code} lang="svelte" class="rounded-t-none border-none" />
		{/if}
	</div>
</section>
