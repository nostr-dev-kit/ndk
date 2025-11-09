<script lang="ts">
	import { getContext } from 'svelte';
	import type { Snippet } from 'svelte';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import { nip19 } from '@nostr-dev-kit/ndk';
	import { marked } from 'marked';
	import { User } from '$lib/registry/ui/user';
	import ComponentAPI from '$site-components/component-api.svelte';
	import PMCommand from '$lib/site/components/ui/pm-command/pm-command.svelte';
	import * as Tabs from '$lib/site/components/ui/tabs';
	import CodeSnippet from '$site-components/code-snippet.svelte';
	import Preview from '$site-components/preview.svelte';

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
		description?: string;
		richDescription?: string | Snippet;
		documentation?: string;
		command: string;
		dependencies?: string[];
		registryDependencies?: string[];
		apiDocs: ComponentDoc[];
		relatedComponents?: RelatedComponent[];
		version?: string;
		updatedAt?: string;
		code?: string;
	}

	interface Props {
		data: ComponentCardData | null;
		preview?: Snippet;
	}

	let { data, preview }: Props = $props();

	const ndk = getContext<NDKSvelte>('ndk');

	// Configure marked for safe rendering
	marked.setOptions({
		breaks: true,
		gfm: true,
		headerIds: true,
		mangle: false
	});
</script>

{#if data}
	<Tabs.Root value="about" class="component-card-tabs">
		<div class="flex flex-col gap-8 border border-border p-8">
			<div class="mb-0 border-b border-border -mx-8 pb-4 px-8">
				<div class="flex flex-row items-end justify-between gap-2">
					<div class="flex flex-row items-end gap-2">
						<h1 class="text-3xl">{data.title}</h1>
						<div class="m-0">
							<User.Root {ndk} pubkey="fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52">
								<div class="flex items-center gap-3">
									<User.Avatar class="!w-6 !h-6 rounded-md" />
									<div class="text-sm">
										<span class="text-muted-foreground font-normal">by</span>
										<User.Name class="text-sm text-foreground font-semibold" />
									</div>
								</div>
							</User.Root>
						</div>
					</div>
					<Tabs.List class="!h-auto !bg-transparent !border-none !p-0">
						<Tabs.Trigger value="about">About</Tabs.Trigger>
						<Tabs.Trigger value="usage">Usage</Tabs.Trigger>
					</Tabs.List>
				</div>
			</div>

			<Tabs.Content value="about" class="flex flex-col gap-8">
				{#if data.richDescription || data.description}
					<section class="flex flex-col gap-4">
						{#if data.richDescription}
							{#if typeof data.richDescription === 'function'}
								{@render data.richDescription()}
							{:else}
								<p class="text-base leading-normal text-foreground m-0">{data.richDescription}</p>
							{/if}
						{:else if data.description}
							<p class="text-base leading-normal text-foreground m-0">{data.description}</p>
						{/if}
					</section>
				{/if}

				{#if data.documentation}
					<section class="flex flex-col gap-4 prose prose-sm max-w-none dark:prose-invert">
						{@html marked.parse(data.documentation)}
					</section>
				{/if}

				{#if preview}
					<Preview code={data.code}>
						{@render preview()}
					</Preview>
				{/if}

				{#if data.relatedComponents && data.relatedComponents.length > 0}
					<section class="flex flex-col gap-4">
						<h3 class="text-xl font-semibold text-foreground m-0">Related Components</h3>
						<div class="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
							{#each data.relatedComponents as related (related.name)}
								<a href={related.path} class="p-4 bg-muted border border-border rounded-lg no-underline transition-all duration-200 cursor-pointer hover:border-primary hover:bg-accent">
									<div class="text-base font-semibold text-foreground mb-1">{related.title}</div>
									<div class="text-sm text-muted-foreground">{related.name}</div>
								</a>
							{/each}
						</div>
					</section>
				{/if}
			</Tabs.Content>

			<Tabs.Content value="usage" class="flex flex-col gap-8">
				<section class="flex flex-col gap-4">
					<h3 class="text-xl font-semibold text-foreground m-0">Installation</h3>
					<PMCommand command="execute" args={['jsrepo', 'add', data.name]} />
				</section>

				<section class="flex flex-col gap-4">
					{#if data.dependencies && data.dependencies.length > 0}
						<div class="mt-4">
							<h4 class="text-sm font-semibold text-foreground m-0 mb-2">Dependencies</h4>
							<ul class="list-none p-0 m-0 flex flex-wrap gap-2">
								{#each data.dependencies as dep (dep)}
									<li class="font-mono text-xs px-2 py-1 bg-accent rounded text-accent-foreground"><code>{dep}</code></li>
								{/each}
							</ul>
						</div>
					{/if}

					{#if data.registryDependencies && data.registryDependencies.length > 0}
						<div class="mt-4">
							<h4 class="text-sm font-semibold text-foreground m-0 mb-2">Registry Dependencies</h4>
							<ul class="list-none p-0 m-0 flex flex-wrap gap-2">
								{#each data.registryDependencies as dep (dep)}
									<li class="font-mono text-xs px-2 py-1 bg-accent rounded text-accent-foreground"><code>{dep}</code></li>
								{/each}
							</ul>
						</div>
					{/if}
				</section>

				<section class="flex flex-col gap-4">
					{#if data.apiDocs && data.apiDocs.length > 0}
						<ComponentAPI components={data.apiDocs} />
					{:else}
						<div class="p-8 border border-destructive rounded-lg bg-destructive/10">
							<h4 class="text-lg font-semibold text-destructive mb-2">⚠️ Missing API Documentation</h4>
							<p class="text-sm text-destructive/90">
								This component is missing API documentation. The <code class="px-1 py-0.5 bg-destructive/20 rounded">apiDocs</code> array must not be empty.
								Please add component documentation including props, events, and usage information.
							</p>
						</div>
					{/if}
				</section>
			</Tabs.Content>
		</div>
	</Tabs.Root>
{/if}
