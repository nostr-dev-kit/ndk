<script lang="ts">
	import UsageSection from './UsageSection.svelte';
	import CodeBlock from './CodeBlock.svelte';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { Copy01Icon, Tick02Icon } from '@hugeicons/core-free-icons';
	import { codeToHtml } from 'shiki';

	interface PropDoc {
		name: string;
		type: string;
		required?: boolean;
		default?: string;
		description: string;
	}

	interface Props {
		/** The code example (optional - hides Code tab if not provided) */
		code?: string;

		/** Title for the demo */
		title?: string;

		/** Description of the demo */
		description?: string;

		/** Component name for install command (e.g., "article-card-portrait") - enables Usage section */
		component?: string;

		/** Props documentation to display in Usage section */
		props?: PropDoc[];

		/** One-liner usage example (e.g., "<FollowButtonPill target={user} />") */
		usageOneLiner?: string;

		/** The preview content */
		children?: import('svelte').Snippet;

		/** Optional controls to show above preview (for prop toggles/selects) */
		controls?: import('svelte').Snippet;

		/** Custom usage content (overrides default UsageSection) */
		usage?: import('svelte').Snippet;
	}

	let { code, title, description, component, props, usageOneLiner, children, controls, usage }: Props = $props();

	let activeTab = $state<'preview' | 'code' | 'usage'>('preview');
	let copySuccess = $state(false);
	let highlightedOneLiner = $state<string>('');
	let isLoadingOneLiner = $state(true);

	// Convert kebab-case to PascalCase for component name
	const pascalCaseName = $derived(
		component
			? component
					.split('-')
					.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
					.join('')
			: ''
	);

	// Use provided one-liner or generate default
	const oneLiner = $derived(
		component ? usageOneLiner || `<${pascalCaseName} {ndk} target={user} />` : ''
	);

	$effect(() => {
		if (!component || !oneLiner) {
			isLoadingOneLiner = false;
			return;
		}

		(async () => {
			try {
				highlightedOneLiner = await codeToHtml(oneLiner, {
					lang: 'svelte',
					themes: {
						light: 'github-light',
						dark: 'github-dark'
					}
				});
				isLoadingOneLiner = false;
			} catch (error) {
				console.error('Failed to highlight one-liner:', error);
				highlightedOneLiner = `<code>${oneLiner}</code>`;
				isLoadingOneLiner = false;
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

<div class="bg-card border border-border rounded-lg overflow-hidden flex flex-col">
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
		{#if code}
			<button
				class="px-4 py-2 bg-transparent border-none border-b-2 border-transparent text-muted-foreground text-sm font-medium cursor-pointer transition-all -mb-px hover:text-foreground hover:bg-muted/30"
				class:!text-primary={activeTab === 'code'}
				class:!border-b-primary={activeTab === 'code'}
				onclick={() => (activeTab = 'code')}
			>
				Code
			</button>
		{/if}
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

	<div class="flex-1 flex flex-col bg-background min-h-[443px]">
		<!-- Preview Tab -->
		<div class:hidden={activeTab !== 'preview'} class="flex flex-col flex-1">
			{#if controls}
				<div class="p-4 px-6 border-b border-border bg-card flex gap-4 items-center flex-wrap controls">
					{@render controls()}
				</div>
			{/if}
			<div class="p-12 flex justify-center items-center flex-1">
				{@render children?.()}
			</div>
			<!-- One-liner below preview -->
			{#if component && !isLoadingOneLiner && highlightedOneLiner}
				<div class="oneliner-below-preview">
					{@html highlightedOneLiner}
				</div>
			{/if}
		</div>

		<!-- Code Tab -->
		<div class:hidden={activeTab !== 'code'} class="relative">
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
			<CodeBlock {code} lang="svelte" class="demo-code" />
		</div>

		<!-- Usage Tab -->
		{#if component || usage}
			<div class:hidden={activeTab !== 'usage'} class="p-8 px-6">
				{#if usage}
					{@render usage()}
				{:else if component}
					<UsageSection componentName={component} {props} />
				{/if}
			</div>
		{/if}
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

	.oneliner-below-preview {
		display: flex;
		justify-content: center;
		padding: 0 3rem 2rem;
		font-size: 0.8125rem;
	}

	.oneliner-below-preview :global(pre) {
		margin: 0;
		padding: 0;
		background: transparent !important;
		overflow: visible;
	}

	.oneliner-below-preview :global(code) {
		font-family: 'Monaco', 'Courier New', monospace;
		font-size: 0.8125rem;
		background: transparent !important;
	}

	:global(.demo-code .code-block pre) {
		margin: 0 !important;
		border: none !important;
		border-radius: 0 !important;
	}
</style>
