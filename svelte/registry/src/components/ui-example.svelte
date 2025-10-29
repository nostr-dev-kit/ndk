<script lang="ts">
	import { onMount } from 'svelte';
	import { codeToHtml } from 'shiki';

	interface Props {
		/** The code example */
		code: string;

		/** Title for the example */
		title?: string;

		/** Description of the example */
		description?: string;

		/** The preview content */
		children?: import('svelte').Snippet;
	}

	let { code, title, description, children }: Props = $props();

	let activeTab = $state<'preview' | 'code'>('preview');
	let highlightedCode = $state<string>('');
	let isLoading = $state(true);
	let copySuccess = $state(false);

	onMount(async () => {
		try {
			highlightedCode = await codeToHtml(code, {
				lang: 'svelte',
				themes: {
					light: 'github-light',
					dark: 'github-dark'
				}
			});
			isLoading = false;
		} catch (error) {
			console.error('Failed to highlight code:', error);
			highlightedCode = `<pre><code>${code}</code></pre>`;
			isLoading = false;
		}
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

<div class="ui-example-card">
	{#if title}
		<h4>{title}</h4>
	{/if}
	{#if description}
		<p class="description">{description}</p>
	{/if}

	<div class="tabs">
		<button
			class="tab"
			class:active={activeTab === 'preview'}
			onclick={() => (activeTab = 'preview')}
		>
			Preview
		</button>
		<button class="tab" class:active={activeTab === 'code'} onclick={() => (activeTab = 'code')}>
			Code
		</button>
	</div>

	<div class="content">
		{#if activeTab === 'preview'}
			<div class="preview">
				{@render children?.()}
			</div>
		{:else if isLoading}
			<div class="loading">
				<div class="spinner"></div>
				Loading syntax highlighting...
			</div>
		{:else}
			<div class="code-wrapper">
				<button class="copy-button" onclick={copyCode} title="Copy code">
					{#if copySuccess}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<polyline points="20 6 9 17 4 12"></polyline>
						</svg>
						Copied!
					{:else}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
							<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
						</svg>
						Copy
					{/if}
				</button>
				<div class="code-container">
					{@html highlightedCode}
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.ui-example-card {
		background: var(--color-card);
		border: 1px solid var(--color-border);
		border-radius: 0.5rem;
		overflow: hidden;
	}

	h4 {
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-foreground);
		margin: 0;
		padding: 1.5rem 1.5rem 0;
	}

	.description {
		font-size: 0.875rem;
		color: var(--color-muted-foreground);
		margin: 0.5rem 0 0;
		padding: 0 1.5rem;
	}

	.tabs {
		display: flex;
		gap: 0.25rem;
		padding: 1rem 1.5rem 0;
		border-bottom: 1px solid var(--color-border);
	}

	.tab {
		padding: 0.5rem 1rem;
		background: transparent;
		border: none;
		border-bottom: 2px solid transparent;
		color: var(--color-muted-foreground);
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
		margin-bottom: -1px;
	}

	.tab:hover {
		color: var(--color-foreground);
		background: color-mix(in srgb, var(--color-muted) calc(0.3 * 100%), transparent);
	}

	.tab.active {
		color: var(--color-primary);
		border-bottom-color: var(--color-primary);
	}

	.content {
		min-height: 200px;
	}

	.preview {
		padding: 2rem 1.5rem;
		display: flex;
		justify-content: center;
		align-items: center;
		background: var(--color-muted);
	}

	.loading {
		padding: 2rem 1.5rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		color: var(--color-muted-foreground);
		font-size: 0.875rem;
	}

	.spinner {
		width: 24px;
		height: 24px;
		border: 2px solid var(--color-muted);
		border-top-color: var(--color-primary);
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.code-wrapper {
		position: relative;
	}

	.copy-button {
		position: absolute;
		top: 1rem;
		right: 1rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		background: var(--color-card);
		border: 1px solid var(--color-border);
		border-radius: 0.375rem;
		color: var(--color-foreground);
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
		z-index: 10;
	}

	.copy-button:hover {
		background: var(--color-muted);
		border-color: var(--color-primary);
	}

	.copy-button svg {
		width: 16px;
		height: 16px;
	}

	.code-container {
		overflow-x: auto;
	}

	.code-container :global(pre) {
		margin: 0;
		padding: 1.5rem;
	}

	.code-container :global(code) {
		font-family: 'Monaco', 'Courier New', monospace;
		font-size: 0.8125rem;
		line-height: 1.6;
	}
</style>
