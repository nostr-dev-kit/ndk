<script lang="ts">
	import { getContext } from 'svelte';
	import type { Snippet } from 'svelte';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import { nip19 } from '@nostr-dev-kit/ndk';
	import { User } from '$lib/registry/ui';
	import ComponentAPI from '$site-components/component-api.svelte';
	import PMCommand from '$lib/components/ui/pm-command/pm-command.svelte';
	import * as Tabs from '$lib/components/ui/tabs';

	export interface ComponentDoc {
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

	export interface RelatedComponent {
		name: string;
		title: string;
		path: string;
	}

	export interface ComponentCardData {
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
		data: ComponentCardData | null;
		preview?: Snippet;
		inline?: boolean;
	}

	let { data, preview, inline = false }: Props = $props();

	const ndk = getContext<NDKSvelte>('ndk');
</script>

{#if data}
	<Tabs.Root value="about" class="component-card-tabs">
		<div class="component-card border border-border p-8">
			<div class="header-section border-b border-border -mx-8 pb-4 px-8">
				<div class="flex flex-row items-end justify-between gap-2">
					<div class="flex flex-row items-end gap-2">
						<h1 class="text-3xl">{data.title}</h1>
						<div class="author-header">
							<User.Root {ndk} pubkey={"fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52"}>
								<div class="author-attribution">
									<User.Avatar class="!w-6 !h-6 rounded-md" />
									<div class="text-sm">
										<span class="author-label">by</span>
										<User.Name class="text-sm" />
									</div>
								</div>
							</User.Root>
						</div>
					</div>
					<Tabs.List class="card-tabs-list">
						<Tabs.Trigger value="about">About</Tabs.Trigger>
						<Tabs.Trigger value="usage">Usage</Tabs.Trigger>
					</Tabs.List>
				</div>
			</div>

			<Tabs.Content value="about" class="tab-content">
				<p class="component-description" class:inline>{data.description}</p>

				{#if data.richDescription}
					<section class="section">
						<p class="description-text">{data.richDescription}</p>
					</section>
				{/if}

				{#if preview}
					<section class="section">
						<h3 class="section-title" class:inline>Preview</h3>
						<div class="preview-container">
							{@render preview()}
						</div>
					</section>
				{/if}

				{#if data.relatedComponents && data.relatedComponents.length > 0}
					<section class="section">
						<h3 class="section-title" class:inline>Related Components</h3>
						<div class="related-grid">
							{#each data.relatedComponents as related (related)}
								<a href={related.path} class="related-card">
									<div class="related-card-title">{related.title}</div>
									<div class="related-card-name">{related.name}</div>
								</a>
							{/each}
						</div>
					</section>
				{/if}
			</Tabs.Content>

			<Tabs.Content value="usage" class="tab-content">
				<section class="section">
					<h3 class="section-title" class:inline>Installation</h3>
					<PMCommand command="execute" args={['shadcn@latest', 'add', data.name]} />
				</section>

				<section class="section">
					{#if data.dependencies && data.dependencies.length > 0}
						<div class="dependencies">
							<h4 class="dependencies-title">Dependencies</h4>
							<ul class="dependencies-list">
								{#each data.dependencies as dep (dep)}
									<li><code>{dep}</code></li>
								{/each}
							</ul>
						</div>
					{/if}

					{#if data.registryDependencies && data.registryDependencies.length > 0}
						<div class="dependencies">
							<h4 class="dependencies-title">Registry Dependencies</h4>
							<ul class="dependencies-list">
								{#each data.registryDependencies as dep (dep)}
									<li><code>{dep}</code></li>
								{/each}
							</ul>
						</div>
					{/if}
				</section>

				{#if data.apiDocs && data.apiDocs.length > 0}
					<section class="section">
						<ComponentAPI components={data.apiDocs} />
					</section>
				{/if}
			</Tabs.Content>
		</div>
	</Tabs.Root>
{/if}

<style>
	.component-card {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.header-section {
		margin-bottom: 0;
	}

	:global(.card-tabs-list) {
		height: auto !important;
		background: transparent !important;
		border: none !important;
		padding: 0 !important;
	}

	:global(.tab-content) {
		margin-top: 2rem;
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}


	.author-header {
		margin: 0;
	}

	.author-attribution {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}


	.author-label {
		color: var(--muted-foreground);
		font-weight: 400;
	}

	:global(.author-name-header) {
		color: var(--foreground);
		font-weight: 600;
	}

	.component-description {
		font-size: 1.125rem;
		color: var(--muted-foreground);
		margin: 0;
		line-height: 1.7;
		max-width: 800px;
	}

	.component-description.inline {
		font-size: 1rem;
	}

	.section {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.section-title {
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--foreground);
		margin: 0;
	}

	.preview-container {
		padding: 2rem;
		background: var(--background);
		border: 1px solid var(--border);
		border-radius: 0.5rem;
		display: flex;
		justify-content: center;
		align-items: center;
		max-height: 600px;
		overflow-y: auto;
	}

	.description-text {
		font-size: 1rem;
		line-height: 1.6;
		color: var(--foreground);
		margin: 0;
	}

	.dependencies {
		margin-top: 1rem;
	}

	.dependencies-title {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--foreground);
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
		background: var(--accent);
		border-radius: 0.25rem;
		color: var(--accent-foreground);
	}

	.related-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 1rem;
	}

	.related-card {
		padding: 1rem;
		background: var(--muted);
		border: 1px solid var(--border);
		border-radius: 0.5rem;
		text-decoration: none;
		transition: all 0.2s;
		cursor: pointer;
	}

	.related-card:hover {
		border-color: var(--primary);
		background: var(--accent);
	}

	.related-card-title {
		font-size: 1rem;
		font-weight: 600;
		color: var(--foreground);
		margin-bottom: 0.25rem;
	}

	.related-card-name {
		font-size: 0.875rem;
		color: var(--muted-foreground);
	}
</style>
