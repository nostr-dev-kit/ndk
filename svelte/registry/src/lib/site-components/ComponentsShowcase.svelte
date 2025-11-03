<script lang="ts">
	import type { Snippet } from 'svelte';
	import ComponentCard from '$site-components/ComponentCard.svelte';
    import { cn } from '$lib/registry/utils';

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

	interface BlockVariant {
		name: string;
		description: string;
		command: string;
		codeSnippet: string;
		preview: Snippet;
		cardData?: ComponentCardData;
	}

	interface Props {
		title?: string;
		description?: string;
		blocks: BlockVariant[];
		class?: string;
	}

	let {
		title = 'Showcase',
		description = '',
		blocks,
		class: className = ''
	}: Props = $props();

	let activeBlockIndex = $state<number | null>(null);
	let blockRefs: HTMLDivElement[] = [];

	// Modal state
	let showModal = $state(false);
	let selectedBlock = $state<BlockVariant | null>(null);

	function handleBlockClick(block: BlockVariant) {
		if (block.cardData) {
			selectedBlock = block;
			showModal = true;
		}
	}

	function closeModal() {
		showModal = false;
		selectedBlock = null;
	}

	$effect(() => {
		if (typeof window === 'undefined') return;

		const updateActiveBlock = () => {
			const viewportCenter = window.innerHeight / 2;
			let closestIndex: number | null = null;
			let minDistance = Infinity;

			blockRefs.forEach((ref, index) => {
				if (!ref) return;
				const rect = ref.getBoundingClientRect();
				const blockCenter = rect.top + rect.height / 2;
				const distance = Math.abs(blockCenter - viewportCenter);

				if (distance < minDistance) {
					minDistance = distance;
					closestIndex = index;
				}
			});

			activeBlockIndex = closestIndex;
		};

		updateActiveBlock();
		window.addEventListener('scroll', updateActiveBlock, { passive: true });
		window.addEventListener('resize', updateActiveBlock, { passive: true });

		return () => {
			window.removeEventListener('scroll', updateActiveBlock);
			window.removeEventListener('resize', updateActiveBlock);
		};
	});
</script>

<section class="mb-32 {className}">
	<!-- Section Header -->
	<div class="mb-12">
		<h2 class="text-3xl font-bold mb-2">{title}</h2>
		{#if description}
			<p class="text-muted-foreground mb-8">
				{description}
			</p>
		{/if}
	</div>

	<div class="space-y-0 relative">
		<!-- Gradient overlay for entire showcase -->
		<div
			class="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background via-background/80 to-transparent pointer-events-none z-50"
		></div>

		{#each blocks as block, index}
			{@const isNotLast = index < blocks.length - 1}
			{@const borderClass = isNotLast ? 'border-b border-border/50' : ''}
			<div
				bind:this={blockRefs[index]}
				class="grid grid-cols-1 lg:grid-cols-7 transition-all duration-700 ease-out {borderClass}"
				class:cursor-pointer={block.cardData}
				style:filter={activeBlockIndex !== index ? 'grayscale(1)' : 'grayscale(0)'}
				style:opacity={activeBlockIndex !== index ? '0.6' : '1'}
				role={block.cardData ? 'button' : undefined}
				tabindex={block.cardData ? 0 : undefined}
				onclick={() => handleBlockClick(block)}
				onkeydown={(e) => {
					if (block.cardData && (e.key === 'Enter' || e.key === ' ')) {
						e.preventDefault();
						handleBlockClick(block);
					}
				}}
				onmouseenter={() => (activeBlockIndex = index)}
			>
				<div
					class={cn(
						"lg:col-span-2 p-10 !pl-0 lg:p-12 lg:border-r  text-right sticky top-10 self-start border-border/50 h-full",
					)}
				>
					<h3 class="text-2xl font-semibold mb-3 tracking-tight">{block.name}</h3>
					<p class="text-sm text-muted-foreground leading-relaxed">
						{block.description}
					</p>
				</div>
				<div class="lg:col-span-5 p-10 lg:p-12 !pr-0 overflow-hidden">
					<div class="flex items-center">
						{@render block.preview()}
					</div>

					<div
						class="mt-6 space-y-4 transition-all duration-700 ease-out"
						style:opacity={activeBlockIndex === index ? '1' : '0.1'}
						style:filter={activeBlockIndex === index ? 'grayscale(0)' : 'grayscale(1)'}
					>
						<div class="font-mono text-sm text-foreground">
							<span class="text-muted-foreground">$</span>
							{block.command}
						</div>
						<pre class="font-mono text-sm leading-relaxed"><code>{@html block.codeSnippet}</code></pre>
					</div>
				</div>
			</div>
		{/each}
	</div>

	<!-- Component Card Modal -->
	<ComponentCard
		bind:show={showModal}
		data={selectedBlock?.cardData ?? null}
		preview={selectedBlock?.preview}
		onClose={closeModal}
	/>
</section>
