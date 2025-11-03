<script lang="ts">
	import type { Snippet } from 'svelte';
	import ComponentAPI from '$site-components/component-api.svelte';

	interface ComponentDoc {
		name: string;
		description: string;
		props?: Array<{
			name: string;
			type: string;
			default?: string;
			description: string;
			required?: boolean;
		}>;
		events?: Array<{ name: string; description: string }>;
		slots?: Array<{ name: string; description: string }>;
		importPath?: string;
	}

	interface RelatedComponent {
		name: string;
		title: string;
		path: string;
	}

	interface ComponentCardData {
		name: string;
		title: string;
		description: string;
		richDescription: string;
		command: string;
		dependencies?: string[];
		registryDependencies?: string[];
		apiDocs: ComponentDoc[];
		relatedComponents?: RelatedComponent[];
		version?: string;
		updatedAt?: string;
	}

	interface Props {
		data: ComponentCardData;
		preview?: Snippet;
	}

	let { data, preview }: Props = $props();
</script>

<div class="component-card-inline">
	<!-- Header -->
	<div class="card-header">
		<h3 class="card-title">{data.title}</h3>
		<p class="card-description">{data.description}</p>
	</div>

	<!-- Live Preview -->
	{#if preview}
		<section class="section">
			<h4 class="section-title">Preview</h4>
			<div class="preview-container">
				{@render preview()}
			</div>
		</section>
	{/if}

	<!-- Rich Description -->
	{#if data.richDescription}
		<section class="section">
			<h4 class="section-title">About</h4>
			<p class="description-text">{data.richDescription}</p>
		</section>
	{/if}

	<!-- Installation -->
	<section class="section">
		<h4 class="section-title">Installation</h4>
		<div class="install-command">
			<span class="prompt">$</span>
			<code>{data.command}</code>
		</div>

		{#if data.dependencies && data.dependencies.length > 0}
			<div class="dependencies">
				<h5 class="dependencies-title">Dependencies</h5>
				<ul class="dependencies-list">
					{#each data.dependencies as dep}
						<li><code>{dep}</code></li>
					{/each}
				</ul>
			</div>
		{/if}

		{#if data.registryDependencies && data.registryDependencies.length > 0}
			<div class="dependencies">
				<h5 class="dependencies-title">Registry Dependencies</h5>
				<ul class="dependencies-list">
					{#each data.registryDependencies as dep}
						<li><code>{dep}</code></li>
					{/each}
				</ul>
			</div>
		{/if}
	</section>

	<!-- API Documentation -->
	{#if data.apiDocs && data.apiDocs.length > 0}
		<section class="section">
			<h4 class="section-title">API</h4>
			<ComponentAPI components={data.apiDocs} />
		</section>
	{/if}

	<!-- Related Components -->
	{#if data.relatedComponents && data.relatedComponents.length > 0}
		<section class="section">
			<h4 class="section-title">Related Components</h4>
			<div class="related-grid">
				{#each data.relatedComponents as related}
					<a href={related.path} class="related-card">
						<div class="related-card-title">{related.title}</div>
						<div class="related-card-name">{related.name}</div>
					</a>
				{/each}
			</div>
		</section>
	{/if}
</div>

<style>
	.component-card-inline {
		padding: 2rem;
		background: var(--color-card);
		border: 1px solid var(--color-border);
		border-radius: 0.75rem;
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.card-header {
		padding-bottom: 1.5rem;
		border-bottom: 1px solid var(--color-border);
	}

	.card-title {
		font-size: 1.875rem;
		font-weight: 700;
		color: var(--color-foreground);
		margin: 0 0 0.5rem 0;
	}

	.card-description {
		font-size: 1rem;
		color: var(--color-muted-foreground);
		margin: 0;
	}

	.section {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.section-title {
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--color-foreground);
		margin: 0;
	}

	.preview-container {
		padding: 2rem;
		background: var(--color-background);
		border: 1px solid var(--color-border);
		border-radius: 0.5rem;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.description-text {
		font-size: 1rem;
		line-height: 1.6;
		color: var(--color-foreground);
		margin: 0;
	}

	.install-command {
		font-family: monospace;
		font-size: 0.875rem;
		padding: 1rem 1.25rem;
		background: var(--color-muted);
		border: 1px solid var(--color-border);
		border-radius: 0.5rem;
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.prompt {
		color: var(--color-muted-foreground);
	}

	.install-command code {
		color: var(--color-foreground);
	}

	.dependencies {
		margin-top: 1rem;
	}

	.dependencies-title {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-foreground);
		margin: 0 0 0.5rem 0;
	}

	.dependencies-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.dependencies-list li {
		font-family: monospace;
		font-size: 0.75rem;
		padding: 0.25rem 0.5rem;
		background: var(--color-accent);
		border-radius: 0.25rem;
		color: var(--color-accent-foreground);
	}

	.related-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 1rem;
	}

	.related-card {
		padding: 1rem;
		background: var(--color-muted);
		border: 1px solid var(--color-border);
		border-radius: 0.5rem;
		text-decoration: none;
		transition: all 0.2s;
		cursor: pointer;
	}

	.related-card:hover {
		border-color: var(--primary);
		background: var(--color-accent);
	}

	.related-card-title {
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-foreground);
		margin-bottom: 0.25rem;
	}

	.related-card-name {
		font-size: 0.875rem;
		color: var(--color-muted-foreground);
	}
</style>
