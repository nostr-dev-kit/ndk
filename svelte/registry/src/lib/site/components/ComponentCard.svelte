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
		importPath: string;
	}

	export interface RelatedComponent {
		name: string;
		title: string;
		path: string;
	}

	export interface ComponentCardData {
		name: string;
		title: string;
		oneLiner?: string;
		description?: string;
		richDescription?: string | Snippet;
		documentation?: string;
		registryName: string;
		dependencies?: string[];
		registryDependencies?: string[];
		apiDoc: ComponentDoc;
		relatedComponents?: RelatedComponent[];
		version?: string;
		updatedAt?: string;
		code?: string;
		registration?: {
			autoRegister: boolean;
			priority: number;
			type?: string;
			kinds?: number[];
			wrapper?: string;
		};
	}

	interface Props {
		data: ComponentCardData | null;
		preview?: Snippet;
	}

	let { data, preview }: Props = $props();

	const ndk = getContext<NDKSvelte>('ndk');
</script>

{#if data}
	<Tabs.Root value="about" class="component-card-tabs">
		<div class="flex flex-col gap-8 border border-border p-8">
			<div class="mb-0 border-b border-border -mx-8 pb-4 px-8">
				<div class="flex flex-row items-end justify-start gap-2">
					<div class="flex flex-col items-start gap-0 flex-1">
						<div class="flex flex-row gap-4 items-end">
							<h1 class="text-3xl">{data.title}</h1>
							<User.Root {ndk} pubkey="fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52">
								<div class="flex items-center gap-2">
									<User.Avatar class="w-5 h-5" />
									<div class="text-xs">
										<span class="text-muted-foreground font-normal">by</span>
										<User.Name class="text-xs text-foreground font-semibold" />
									</div>
								</div>
							</User.Root>
						</div>
						<div class="m-0 flex flex-col gap-2">
							{#if data.oneLiner}
								<p class="text-muted-foreground">{data.oneLiner}</p>
							{/if}
							{#if data.registration}
								<div class="flex flex-wrap gap-2 items-center">
									<span class="text-xs px-2 py-1 bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 rounded-md font-mono">
										Auto-register
									</span>
									<span class="text-xs px-2 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 rounded-md font-mono">
										Priority: {data.registration.priority}
									</span>
									<span class="text-xs px-2 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 rounded-md font-mono">
										{#if data.registration.type}
											{#if data.registration.type === 'fallback'}
												Fallback handler
											{:else if data.registration.type === 'mention'}
												Mentions
											{:else if data.registration.type === 'hashtag'}
												Hashtags
											{:else if data.registration.type === 'link'}
												Links
											{:else if data.registration.type === 'media'}
												Media
											{:else}
												{data.registration.type}
											{/if}
										{:else if data.registration.kinds}
											Kind {data.registration.kinds.join(', ')}
										{:else if data.registration.wrapper}
											{data.registration.wrapper}
										{/if}
									</span>
								</div>
							{/if}
						</div>
					</div>
					<Tabs.List class="">
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
					<section class="prose prose-sm max-w-none dark:prose-invert">
						{@html marked.parse(data.documentation, { breaks: true, gfm: true })}
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
					<PMCommand command="execute" args={['jsrepo', 'add', data.registryName]} />
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
					<ComponentAPI component={data.apiDoc} />
				</section>
			</Tabs.Content>
		</div>
	</Tabs.Root>
{/if}
