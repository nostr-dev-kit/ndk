<script lang="ts">
	import { cn } from '$lib/registry/utils/cn.js';

	interface Prop {
		name: string;
		type: string;
		default?: string;
		description: string;
		required?: boolean;
	}

	interface ComponentDoc {
		name: string;
		description: string;
		props?: Prop[];
		events?: { name: string; description: string }[];
		slots?: { name: string; description: string }[];
		importPath?: string;
	}

	interface Props {
		components: ComponentDoc[];

		title?: string;
	}

	let { components, title = 'Component API' }: Props = $props();
</script>

<section class="my-8">
	<h2 class="text-2xl font-bold text-foreground m-0 mb-6">{title}</h2>

	<div class="flex flex-col gap-4">
		{#each components as component (component.name)}
			<div class="bg-card border border-border rounded-xl p-6">
				<div class="mb-3">
					<h3 class="text-xl font-semibold text-foreground m-0 mb-2">{component.name}</h3>
					{#if component.importPath}
						<code class="inline-block text-xs text-muted-foreground bg-muted px-2 py-1 rounded font-mono">{component.importPath}</code>
					{/if}
				</div>

				<p class="text-sm text-muted-foreground m-0 mb-6 leading-relaxed">{component.description}</p>

				{#if component.props && component.props.length > 0}
					<div class={cn("mt-6 pt-6 border-t border-border first:mt-0 first:pt-0 first:border-t-0")}>
						<h4 class="text-base font-semibold text-foreground m-0 mb-4">Props</h4>
						<div class="flex flex-col gap-5">
							{#each component.props as prop (prop.name)}
								<div class="bg-muted/30 p-4 rounded-lg border border-border">
									<div class="flex items-center gap-2 mb-2">
										<code class="text-sm font-semibold text-primary font-mono">{prop.name}</code>
										{#if prop.required}
											<span class="text-[0.6875rem] font-semibold text-destructive-foreground bg-destructive px-1.5 py-0.5 rounded uppercase tracking-wide">required</span>
										{/if}
									</div>
									<code class="block text-[0.8125rem] text-foreground bg-muted p-2 rounded font-mono my-2 overflow-x-auto">{prop.type}</code>
									{#if prop.default}
										<div class="flex items-center gap-2 text-[0.8125rem] text-muted-foreground my-2">
											<span class="font-medium">Default:</span>
											<code class="font-mono bg-muted px-1.5 py-0.5 rounded">{prop.default}</code>
										</div>
									{/if}
									<p class="text-sm text-muted-foreground mt-2 mb-0 leading-relaxed">{prop.description}</p>
								</div>
							{/each}
						</div>
					</div>
				{/if}

				{#if component.events && component.events.length > 0}
					<div class={cn("mt-6 pt-6 border-t border-border first:mt-0 first:pt-0 first:border-t-0")}>
						<h4 class="text-base font-semibold text-foreground m-0 mb-4">Events</h4>
						<div class="flex flex-col gap-5">
							{#each component.events as event (event.name)}
								<div class="bg-muted/30 p-4 rounded-lg border border-border">
									<code class="text-sm font-semibold text-primary font-mono">{event.name}</code>
									<p class="text-sm text-muted-foreground mt-2 mb-0 leading-relaxed">{event.description}</p>
								</div>
							{/each}
						</div>
					</div>
				{/if}

				{#if component.slots && component.slots.length > 0}
					<div class={cn("mt-6 pt-6 border-t border-border first:mt-0 first:pt-0 first:border-t-0")}>
						<h4 class="text-base font-semibold text-foreground m-0 mb-4">Slots</h4>
						<div class="flex flex-col gap-5">
							{#each component.slots as slot (slot.name)}
								<div class="bg-muted/30 p-4 rounded-lg border border-border">
									<code class="text-sm font-semibold text-primary font-mono">{slot.name}</code>
									<p class="text-sm text-muted-foreground mt-2 mb-0 leading-relaxed">{slot.description}</p>
								</div>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		{/each}
	</div>
</section>
