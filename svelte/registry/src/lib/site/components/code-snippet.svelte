<!--
Simple syntax-highlighted code snippet with copy button.
Use for inline documentation code examples (not for Preview/Code/Install tabs - use CodePreview for that).
-->
<script lang="ts">
	import CodeBlock from './CodeBlock.svelte';
	import { cn } from '$lib/registry/utils/cn.js';

	interface Props {
		code: string;
		lang?: string;
		title?: string;
		class?: string;
	}

	let { code, lang = 'svelte', title, class: className = '' }: Props = $props();

	let copySuccess = $state(false);

	async function copyCode() {
		try {
			await navigator.clipboard.writeText(code);
			copySuccess = true;
			setTimeout(() => {
				copySuccess = false;
			}, 2000);
		} catch (error) {
			console.error('Failed to copy code:', error);
		}
	}
</script>

<div class="relative">
	{#if title}
		<div class="text-sm font-semibold text-foreground mb-2">{title}</div>
	{/if}

	<div class={cn("relative border border-border rounded-lg overflow-hidden", className)}>
		<button
			class="absolute top-3 right-3 p-2 bg-card border border-border rounded-md cursor-pointer text-foreground transition-all duration-200 z-10 hover:bg-muted active:scale-95"
			onclick={copyCode}
			title="Copy code"
			aria-label="Copy code to clipboard"
		>
			{#if copySuccess}
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<polyline points="20 6 9 17 4 12"></polyline>
				</svg>
			{:else}
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
					<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
				</svg>
			{/if}
		</button>
		<CodeBlock {code} {lang} />
	</div>
</div>
