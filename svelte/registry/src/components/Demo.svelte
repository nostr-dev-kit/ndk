<script lang="ts">
	import { codeToHtml } from 'shiki';
	import InstallCommand from './install-command.svelte';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { Copy01Icon, Tick02Icon } from '@hugeicons/core-free-icons';

	interface Props {
		/** The code example */
		code: string;

		/** Title for the demo */
		title?: string;

		/** Description of the demo */
		description?: string;

		/** Component name for install command (e.g., "article-card-portrait") - enables Usage tab */
		component?: string;

		/** The preview content */
		children?: import('svelte').Snippet;

		/** Optional controls to show above preview (for prop toggles/selects) */
		controls?: import('svelte').Snippet;
	}

	let { code, title, description, component, children, controls }: Props = $props();

	let activeTab = $state<'preview' | 'code' | 'usage'>('preview');
	let highlightedCode = $state<string>('');
	let isLoading = $state(true);
	let copySuccess = $state(false);

	$effect(() => {
		(async () => {
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

<div class="bg-card border border-border rounded-lg overflow-hidden min-h-[300px] flex flex-col">
	{#if title}
		<h3 class="text-lg font-semibold text-foreground m-0 px-6 pt-6">{title}</h3>
	{/if}
	{#if description}
		<p class="text-sm text-muted-foreground mt-2 px-6">{description}</p>
	{/if}

	<div class="flex gap-1 px-6 pt-4 border-b border-border">
		<button
			class="px-4 py-2 bg-transparent border-none border-b-2 border-transparent text-muted-foreground text-sm font-medium cursor-pointer transition-all -mb-px hover:text-foreground hover:bg-muted/30"
			class:!text-primary={activeTab === 'preview'}
			class:!border-b-primary={activeTab === 'preview'}
			onclick={() => (activeTab = 'preview')}
		>
			Preview
		</button>
		<button
			class="px-4 py-2 bg-transparent border-none border-b-2 border-transparent text-muted-foreground text-sm font-medium cursor-pointer transition-all -mb-px hover:text-foreground hover:bg-muted/30"
			class:!text-primary={activeTab === 'code'}
			class:!border-b-primary={activeTab === 'code'}
			onclick={() => (activeTab = 'code')}
		>
			Code
		</button>
		{#if component}
			<button
				class="px-4 py-2 bg-transparent border-none border-b-2 border-transparent text-muted-foreground text-sm font-medium cursor-pointer transition-all -mb-px hover:text-foreground hover:bg-muted/30"
				class:!text-primary={activeTab === 'usage'}
				class:!border-b-primary={activeTab === 'usage'}
				onclick={() => (activeTab = 'usage')}
			>
				Usage
			</button>
		{/if}
	</div>

	<div class="flex-1 flex flex-col bg-background">
		<!-- Preview Tab -->
		<div class:hidden={activeTab !== 'preview'}>
			{#if controls}
				<div class="p-4 px-6 border-b border-border bg-card flex gap-4 items-center flex-wrap controls">
					{@render controls()}
				</div>
			{/if}
			<div class="p-8 px-6 flex justify-center items-center flex-1">
				{@render children?.()}
			</div>
		</div>

		<!-- Usage Tab -->
		{#if component}
			<div class:hidden={activeTab !== 'usage'} class="p-8 px-6">
				<InstallCommand componentName={component} />
			</div>
		{/if}

		<!-- Code Tab -->
		<div class:hidden={activeTab !== 'code'}>
			{#if isLoading}
				<div class="flex flex-col items-center justify-center gap-4 p-8">
					<div class="w-6 h-6 border-2 border-muted border-t-primary rounded-full animate-spin"></div>
					<span class="text-sm text-muted-foreground">Loading syntax highlighting...</span>
				</div>
			{:else}
				<div class="relative">
					<button
						class="absolute top-4 right-4 z-10 flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-md text-foreground text-sm font-medium cursor-pointer transition-all hover:bg-muted hover:border-primary"
						onclick={copyCode}
						title="Copy code"
					>
						{#if copySuccess}
							<HugeiconsIcon icon={Tick02Icon} size={16} strokeWidth={2} />
							Copied!
						{:else}
							<HugeiconsIcon icon={Copy01Icon} size={16} strokeWidth={2} />
							Copy
						{/if}
					</button>
					<div class="overflow-x-auto code-container">
						{@html highlightedCode}
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.controls :global(label) {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-foreground);
	}

	.controls :global(select) {
		padding: 0.375rem 0.75rem;
		border: 1px solid var(--color-border);
		border-radius: 0.375rem;
		background: var(--color-background);
		color: var(--color-foreground);
		font-size: 0.875rem;
		cursor: pointer;
		transition: border-color 0.2s;
	}

	.controls :global(select:hover) {
		border-color: var(--color-primary);
	}

	.controls :global(select:focus) {
		outline: none;
		border-color: var(--color-primary);
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) calc(0.1 * 100%), transparent);
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
