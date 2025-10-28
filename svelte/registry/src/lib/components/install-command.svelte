<script lang="ts">
	interface Props {
		componentName: string;
		/** Optional additional information about what gets installed */
		note?: string;
		/** Show the full URL format instead of shorthand */
		showFullUrl?: boolean;
	}

	let { componentName, note, showFullUrl = false }: Props = $props();

	let copySuccess = $state(false);

	const command = $derived(
		showFullUrl
			? `npx shadcn-svelte@latest add http://shadcn.ndk.fyi/registry.json#${componentName}`
			: `npx shadcn-svelte@latest add ${componentName}`
	);

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
</script>

<div class="install-command">
	<div class="command-wrapper">
		<code class="command-text">{command}</code>
		<button class="copy-button" onclick={copyCommand} title="Copy command">
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
					<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2 2v1"></path>
				</svg>
			{/if}
		</button>
	</div>
	{#if note}
		<p class="note">{note}</p>
	{/if}
</div>

<style>
	.install-command {
		margin: 1rem 0;
	}

	.command-wrapper {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		background: hsl(var(--color-muted));
		border: 1px solid hsl(var(--color-border));
		border-radius: 0.5rem;
	}

	.command-text {
		flex: 1;
		font-family: 'Monaco', 'Courier New', monospace;
		font-size: 0.875rem;
		color: hsl(var(--color-foreground));
		user-select: all;
	}

	.copy-button {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.5rem;
		background: hsl(var(--color-card));
		border: 1px solid hsl(var(--color-border));
		border-radius: 0.375rem;
		color: hsl(var(--color-foreground));
		cursor: pointer;
		transition: all 0.2s;
		flex-shrink: 0;
	}

	.copy-button:hover {
		background: hsl(var(--color-background));
		border-color: hsl(var(--color-primary));
	}

	.copy-button svg {
		width: 16px;
		height: 16px;
	}

	.note {
		margin: 0.5rem 0 0;
		font-size: 0.875rem;
		color: hsl(var(--color-muted-foreground));
	}
</style>
