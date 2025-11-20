<!--
Standardized API documentation table for props, methods, events, etc.
Use for: component API documentation across all component pages.
-->
<script lang="ts">
	import { cn } from '$lib/registry/utils/cn.js';

	interface ApiRow {
		name: string;
		type: string;
		default?: string;
		description: string;
		required?: boolean;
	}

	interface Props {
		title?: string;
		rows: ApiRow[];
		class?: string;
	}

	let { title, rows, class: className = '' }: Props = $props();
</script>

{#if title}
	<h3 class="text-xl font-semibold text-foreground">{title}</h3>
{/if}

<div class={cn("my-4 mb-8 border border-border rounded-lg overflow-hidden", className)}>
	<table class="w-full border-collapse text-sm md:text-[0.8125rem]">
		<thead class="bg-transparent">
			<tr>
				<th class="text-left px-4 py-3 md:px-3 md:py-2 font-semibold text-foreground border-b border-border">Property</th>
				<th class="text-left px-4 py-3 md:px-3 md:py-2 font-semibold text-foreground border-b border-border">Type</th>
				<th class="text-left px-4 py-3 md:px-3 md:py-2 font-semibold text-foreground border-b border-border">Description</th>
			</tr>
		</thead>
		<tbody>
			{#each rows as row, i (row.name)}
				<tr class="group">
					<td class={cn("px-4 py-3 md:px-3 md:py-2 text-muted-foreground border-b border-border align-top", i === rows.length - 1 && "border-b-0")}>
						<div class="flex items-center gap-2">
							<code class="text-foreground font-medium text-[0.8125rem] font-mono">{row.name}</code>
							{#if row.required}
								<span class="inline-block ml-2 px-1.5 py-0.5 bg-muted text-foreground border border-border rounded text-[0.6875rem] font-medium tracking-wide">required</span>
							{/if}
						</div>
					</td>
					<td class={cn("px-4 py-3 md:px-3 md:py-2 text-muted-foreground border-b border-border align-top", i === rows.length - 1 && "border-b-0")}>
						<code class="text-muted-foreground text-[0.8125rem] font-mono">{row.type}</code>
					</td>
					<td class={cn("px-4 py-3 md:px-3 md:py-2 text-muted-foreground border-b border-border align-top", i === rows.length - 1 && "border-b-0")}>
						<div class="leading-relaxed">
							{row.description}
							{#if row.default !== undefined}
								<div class="mt-2 text-[0.8125rem] text-muted-foreground">
									Default: <code class="ml-1 text-muted-foreground text-[0.8125rem] font-mono">{row.default}</code>
								</div>
							{/if}
						</div>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
