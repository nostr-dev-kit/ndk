<script lang="ts">
	import { marked } from 'marked';
	import * as Tabs from '$lib/site/components/ui/tabs';
	import PMCommand from '$lib/site/components/ui/pm-command/pm-command.svelte';
	import CodeBlock from '$site-components/CodeBlock.svelte';
	import ApiTable from '$site-components/api-table.svelte';

	export interface BuilderParameter {
		name: string;
		type: string;
		description: string;
		required?: boolean;
		default?: string;
	}

	export interface BuilderReturn {
		name: string;
		type: string;
		description: string;
	}

	export interface BuilderCardData {
		name: string;
		title: string;
		oneLiner?: string;
		description?: string;
		importPath: string;
		registryName: string;
		dependencies?: string[];
		nips?: string[];
		parameters: BuilderParameter[];
		returns: BuilderReturn[];
		usageExample?: string;
	}

	interface Props {
		data: BuilderCardData | null;
	}

	let { data }: Props = $props();

	marked.setOptions({
		breaks: true,
		gfm: true
	});
</script>

{#if data}
	<Tabs.Root value="about" class="builder-card-tabs">
		<div class="flex flex-col gap-8 border border-border p-8">
			<div class="mb-0 border-b border-border -mx-8 pb-4 px-8">
				<div class="flex flex-row items-end justify-between gap-2">
					<h1 class="text-3xl">{data.title}</h1>
					<Tabs.List class="!h-auto !bg-transparent !border-none !p-0">
						<Tabs.Trigger value="about">About</Tabs.Trigger>
						<Tabs.Trigger value="usage">Usage</Tabs.Trigger>
					</Tabs.List>
				</div>
				{#if data.oneLiner}
					<p class="text-muted-foreground mt-2">{data.oneLiner}</p>
				{/if}
			</div>

			<Tabs.Content value="about" class="flex flex-col gap-8">
				{#if data.usageExample}
					<section class="flex flex-col">
						<CodeBlock lang="typescript" code={data.usageExample} />
					</section>
				{/if}

				{#if data.description}
					<section class="flex flex-col prose prose-sm max-w-none dark:prose-invert">
						{@html marked.parse(data.description)}
					</section>
				{/if}
			</Tabs.Content>

			<Tabs.Content value="usage" class="flex flex-col gap-8">
				<section class="flex flex-col gap-2">
					<h3 class="text-xl font-semibold text-foreground m-0">Installation</h3>
					<PMCommand command="execute" args={['jsrepo', 'add', data.registryName]} />
				</section>

				<section class="flex flex-col gap-2">
					<h3 class="text-xl font-semibold text-foreground m-0">Import</h3>
					<CodeBlock lang="typescript" code={data.importPath} />
				</section>

				{#if data.dependencies && data.dependencies.length > 0}
					<section class="flex flex-col gap-2">
						<h4 class="text-sm font-semibold text-foreground m-0 mb-2">Dependencies</h4>
						<ul class="list-none p-0 m-0 flex flex-wrap gap-2">
							{#each data.dependencies as dep (dep)}
								<li class="font-mono text-xs px-2 py-1 bg-accent rounded text-accent-foreground">
									<code>{dep}</code>
								</li>
							{/each}
						</ul>
					</section>
				{/if}

				{#if data.nips && data.nips.length > 0}
					<section class="flex flex-col gap-2">
						<h4 class="text-sm font-semibold text-foreground m-0 mb-2">Related NIPs</h4>
						<div class="flex flex-wrap gap-2">
							{#each data.nips as nip}
								<span class="px-2 py-1 bg-muted rounded text-sm">NIP-{nip}</span>
							{/each}
						</div>
					</section>
				{/if}

				{#if data.parameters?.length}
					<section class="flex flex-col gap-2">
						<ApiTable title="Parameters" rows={data.parameters} />
					</section>
				{/if}

				{#if data.returns?.length}
					<section class="flex flex-col gap-2">
						<ApiTable
							title="Returns"
							rows={data.returns.map((r) => ({
								name: r.name,
								type: r.type,
								description: r.description
							}))}
						/>
					</section>
				{/if}

				{#if data.usageExample}
					<section class="flex flex-col gap-2">
						<h3 class="text-xl font-semibold text-foreground m-0">Example</h3>
						<CodeBlock lang="typescript" code={data.usageExample} />
					</section>
				{/if}
			</Tabs.Content>
		</div>
	</Tabs.Root>
{/if}
