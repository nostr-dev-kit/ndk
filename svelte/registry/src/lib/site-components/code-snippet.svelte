<!--
Simple syntax-highlighted code snippet with copy button.
Use for inline documentation code examples (not for Preview/Code/Install tabs - use CodePreview for that).
-->
<script lang="ts">
	import { codeToHtml } from 'shiki';

	interface Props {
		code: string;
		lang?: string;
		title?: string;
		showLineNumbers?: boolean;
		class?: string;
	}

	let { code, lang = 'svelte', title, showLineNumbers = false, class: className = '' }: Props = $props();

	let highlightedCode = $state<string>('');
	let isLoading = $state(true);
	let copySuccess = $state(false);

	$effect(() => {
		(async () => {
			try {
				highlightedCode = await codeToHtml(code, {
					lang,
					themes: {
						light: 'github-light',
						dark: 'github-dark'
					},
					...(showLineNumbers && {
						decorations: [
							{
								start: 0,
								end: code.length,
								properties: { class: 'line-numbers' }
							}
						]
					})
				});
				isLoading = false;
			} catch (error) {
				console.error('Failed to highlight code:', error);
				highlightedCode = `<pre><code>${code}</code></pre>`;
				isLoading = false;
			}
		})();
	});

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

<div class="code-snippet {className}">
	{#if title}
		<div class="code-title">{title}</div>
	{/if}

	<div class="code-container">
		{#if isLoading}
			<div class="loading">
				<div class="spinner"></div>
				Loading...
			</div>
		{:else}
			<button class="copy-button" onclick={copyCode} title="Copy code" aria-label="Copy code to clipboard">
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
			<div class="code-content">
				{@html highlightedCode}
			</div>
		{/if}
	</div>
</div>

<style>
	.code-snippet {
		position: relative;
		margin: 1rem 0;
	}

	.code-title {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--foreground);
		margin-bottom: 0.5rem;
	}

	.code-container {
		position: relative;
		background: color-mix(in srgb, var(--muted) calc(0.5 * 100%), transparent);
		border: 1px solid var(--border);
		border-radius: 0.5rem;
		overflow: hidden;
	}

	.loading {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 2rem;
		color: var(--muted-foreground);
		font-size: 0.875rem;
	}

	.spinner {
		width: 1rem;
		height: 1rem;
		border: 2px solid color-mix(in srgb, var(--muted-foreground) calc(0.3 * 100%), transparent);
		border-top-color: var(--primary);
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.copy-button {
		position: absolute;
		top: 0.75rem;
		right: 0.75rem;
		padding: 0.5rem;
		background: var(--card);
		border: 1px solid var(--border);
		border-radius: 0.375rem;
		cursor: pointer;
		color: var(--foreground);
		transition: all 0.2s;
		z-index: 10;
	}

	.copy-button:hover {
		background: var(--muted);
	}

	.copy-button:active {
		transform: scale(0.95);
	}

	.code-content :global(pre) {
		margin: 0;
		padding: 1rem;
		overflow-x: auto;
		font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
		font-size: 0.875rem;
		line-height: 1.5;
		background: transparent !important;
	}

	.code-content :global(code) {
		font-family: inherit;
		font-size: inherit;
	}
</style>
