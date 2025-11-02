<script lang="ts">
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
		componentName: string;
		/** Props documentation to display */
		props?: PropDoc[];
		/** Optional additional information about what gets installed */
		note?: string;
		/** Show the full URL format instead of shorthand */
		showFullUrl?: boolean;
	}

	let { componentName, props, note, showFullUrl = false }: Props = $props();

	let copySuccess = $state(false);
	let copyUsageSuccess = $state(false);
	let highlightedUsage = $state<string>('');
	let isLoadingUsage = $state(true);

	const command = $derived(
		showFullUrl
			? `npx shadcn-svelte@latest add http://shadcn.ndk.fyi/registry.json#${componentName}`
			: `npx shadcn-svelte@latest add ${componentName}`
	);

	// Convert kebab-case to PascalCase for component name
	const pascalCaseName = $derived(
		componentName
			.split('-')
			.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
			.join('')
	);

	const usageSnippet = $derived(`<${'script'}>
  import { ${pascalCaseName} } from '$lib/registry/blocks';
</${'script'}>

<${pascalCaseName} {ndk} target={user} />`);

	$effect(() => {
		(async () => {
			try {
				highlightedUsage = await codeToHtml(usageSnippet, {
					lang: 'svelte',
					themes: {
						light: 'github-light',
						dark: 'github-dark'
					}
				});
				isLoadingUsage = false;
			} catch (error) {
				console.error('Failed to highlight usage:', error);
				highlightedUsage = `<pre><code>${usageSnippet}</code></pre>`;
				isLoadingUsage = false;
			}
		})();
	});

	async function copyCommand() {
		try {
			await navigator.clipboard.writeText(command);
			copySuccess = true;
			setTimeout(() => {
				copySuccess = false;
			}, 2000);
		} catch (error) {
			console.error('Failed to copy command:', error);
		}
	}

	async function copyUsage() {
		try {
			await navigator.clipboard.writeText(usageSnippet);
			copyUsageSuccess = true;
			setTimeout(() => {
				copyUsageSuccess = false;
			}, 2000);
		} catch (error) {
			console.error('Failed to copy usage:', error);
		}
	}
</script>

<div class="usage-section">
	<!-- Install Command Section -->
	<section>
		<div class="section-header">
			<h4>Install</h4>
			<p class="section-description">Add this component to your project using the following command:</p>
		</div>
		<div class="command-wrapper">
			<code class="command-text">{command}</code>
			<button class="copy-button" onclick={copyCommand} title="Copy command">
				{#if copySuccess}
					<HugeiconsIcon icon={Tick02Icon} size={16} strokeWidth={2} />
				{:else}
					<HugeiconsIcon icon={Copy01Icon} size={16} strokeWidth={2} />
				{/if}
			</button>
		</div>
		{#if note}
			<p class="note">{note}</p>
		{/if}
	</section>

	<!-- Usage Example Section -->
	<section>
		<div class="section-header">
			<h4>Basic Usage</h4>
			<p class="section-description">Import and use the component in your Svelte files:</p>
		</div>
		<div class="usage-wrapper">
			{#if isLoadingUsage}
				<div class="loading">
					<div class="spinner"></div>
					<span>Loading syntax highlighting...</span>
				</div>
			{:else}
				<button
					class="copy-button copy-button-absolute"
					onclick={copyUsage}
					title="Copy usage example"
				>
					{#if copyUsageSuccess}
						<HugeiconsIcon icon={Tick02Icon} size={16} strokeWidth={2} />
					{:else}
						<HugeiconsIcon icon={Copy01Icon} size={16} strokeWidth={2} />
					{/if}
				</button>
				<div class="code-container">
					{@html highlightedUsage}
				</div>
			{/if}
		</div>
	</section>

	<!-- Props Documentation Section -->
	{#if props && props.length > 0}
		<section>
			<div class="section-header">
				<h4>Props</h4>
				<p class="section-description">Configure the component with these properties:</p>
			</div>
			<div class="props-table-wrapper">
				<table class="props-table">
					<thead>
						<tr>
							<th>Prop</th>
							<th>Type</th>
							<th>Default</th>
							<th>Description</th>
						</tr>
					</thead>
					<tbody>
						{#each props as prop}
							<tr>
								<td class="prop-name">
									{prop.name}
									{#if prop.required}
										<span class="required-badge">required</span>
									{/if}
								</td>
								<td class="prop-type"><code>{prop.type}</code></td>
								<td class="prop-default">
									{#if prop.default}
										<code>{prop.default}</code>
									{:else}
										<span class="text-muted">—</span>
									{/if}
								</td>
								<td class="prop-description">{prop.description}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</section>
	{/if}
</div>

<style>
	.usage-section {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.section-header {
		margin-bottom: 1rem;
	}

	.section-header h4 {
		margin: 0 0 0.5rem 0;
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-foreground);
	}

	.section-description {
		margin: 0;
		font-size: 0.875rem;
		color: var(--color-muted-foreground);
	}

	.command-wrapper {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		background: var(--color-muted);
		border: 1px solid var(--color-border);
		border-radius: 0.5rem;
	}

	.command-text {
		flex: 1;
		font-family: 'Monaco', 'Courier New', monospace;
		font-size: 0.875rem;
		color: var(--color-foreground);
		user-select: all;
	}

	.copy-button {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.5rem;
		background: var(--color-card);
		border: 1px solid var(--color-border);
		border-radius: 0.375rem;
		color: var(--color-foreground);
		cursor: pointer;
		transition: all 0.2s;
		flex-shrink: 0;
	}

	.copy-button:hover {
		background: var(--color-background);
		border-color: var(--color-primary);
	}

	.copy-button svg {
		width: 16px;
		height: 16px;
	}

	.copy-button-absolute {
		position: absolute;
		top: 1rem;
		right: 1rem;
		z-index: 10;
	}

	.note {
		margin: 0.5rem 0 0;
		font-size: 0.875rem;
		color: var(--color-muted-foreground);
	}

	.usage-wrapper {
		position: relative;
		border: 1px solid var(--color-border);
		border-radius: 0.5rem;
		overflow: hidden;
		background: var(--color-background);
	}

	.loading {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		padding: 2rem;
		font-size: 0.875rem;
		color: var(--color-muted-foreground);
	}

	.spinner {
		width: 1.5rem;
		height: 1.5rem;
		border: 2px solid var(--color-muted);
		border-top-color: var(--color-primary);
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.code-container :global(pre) {
		margin: 0;
		padding: 1.5rem;
		overflow-x: auto;
	}

	.code-container :global(code) {
		font-family: 'Monaco', 'Courier New', monospace;
		font-size: 0.8125rem;
		line-height: 1.6;
	}

	/* Props Table Styles */
	.props-table-wrapper {
		border: 1px solid var(--color-border);
		border-radius: 0.5rem;
		overflow: hidden;
		background: var(--color-background);
	}

	.props-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.875rem;
	}

	.props-table thead {
		background: var(--color-muted);
		border-bottom: 1px solid var(--color-border);
	}

	.props-table th {
		padding: 0.75rem 1rem;
		text-align: left;
		font-weight: 600;
		color: var(--color-foreground);
		font-size: 0.8125rem;
		text-transform: uppercase;
		letter-spacing: 0.025em;
	}

	.props-table tbody tr {
		border-bottom: 1px solid var(--color-border);
	}

	.props-table tbody tr:last-child {
		border-bottom: none;
	}

	.props-table tbody tr:hover {
		background: var(--color-muted);
	}

	.props-table td {
		padding: 0.75rem 1rem;
		vertical-align: top;
	}

	.prop-name {
		font-weight: 500;
		color: var(--color-foreground);
		white-space: nowrap;
	}

	.required-badge {
		display: inline-block;
		margin-left: 0.5rem;
		padding: 0.125rem 0.375rem;
		font-size: 0.6875rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.025em;
		color: var(--color-destructive-foreground);
		background: var(--color-destructive);
		border-radius: 0.25rem;
	}

	.prop-type code,
	.prop-default code {
		padding: 0.125rem 0.375rem;
		font-family: 'Monaco', 'Courier New', monospace;
		font-size: 0.75rem;
		background: var(--color-muted);
		border: 1px solid var(--color-border);
		border-radius: 0.25rem;
		color: var(--color-foreground);
		white-space: nowrap;
	}

	.prop-description {
		color: var(--color-muted-foreground);
		line-height: 1.5;
	}

	.text-muted {
		color: var(--color-muted-foreground);
	}
</style>
