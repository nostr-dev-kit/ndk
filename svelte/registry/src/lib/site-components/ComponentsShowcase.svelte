<script lang="ts">
	import type { Snippet } from 'svelte';
	import ComponentCard from '$site-components/ComponentCard.svelte';
	import { PMCommand } from '$lib/components/ui/pm-command';
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
		preview: Snippet;
		cardData?: ComponentCardData;
		orientation?: 'horizontal' | 'vertical';
	}

	interface Props {
		blocks: BlockVariant[];
		class?: string;
	}

	let {
		blocks,
		class: className = ''
	}: Props = $props();

	let activeBlockIndex = $state<number | null>(null);
	let blockRefs: HTMLDivElement[] = [];
	let previewRefs: HTMLDivElement[] = [];
	let scrollIntervals: number[] = [];
	let scrollPositions: number[] = [];

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

	// Auto-scroll effect for inactive preview areas
	$effect(() => {
		if (typeof window === 'undefined') return;

		// Initialize scroll positions
		scrollPositions = blocks.map(() => 0);

		const animateScroll = (index: number) => {
			const container = previewRefs[index];
			const block = blocks[index];
			if (!container || !block) return;

			const isActive = activeBlockIndex === index;
			const isHorizontal = block.orientation === 'horizontal';

			if (!isActive) {
				// Increment virtual scroll position by small amount each frame
				scrollPositions[index] += 0.06; // ~60fps = 3.6px/sec

				if (isHorizontal) {
					// Horizontal scrolling
					if (container.scrollWidth > container.clientWidth) {
						// Loop back to start when reaching end
						if (scrollPositions[index] >= container.scrollWidth - container.clientWidth) {
							scrollPositions[index] = 0;
						}
						container.scrollTo({ left: scrollPositions[index], behavior: 'instant' });
					}
				} else {
					// Vertical scrolling
					if (container.scrollHeight > container.clientHeight) {
						// Loop back to top when reaching bottom
						if (scrollPositions[index] >= container.scrollHeight - container.clientHeight) {
							scrollPositions[index] = 0;
						}
						container.scrollTo({ top: scrollPositions[index], behavior: 'instant' });
					}
				}
			}

			scrollIntervals[index] = requestAnimationFrame(() => animateScroll(index));
		};

		// Start animation for each block
		blocks.forEach((_, index) => {
			animateScroll(index);
		});

		return () => {
			// Clean up all animation frames
			scrollIntervals.forEach(frameId => {
				if (frameId) cancelAnimationFrame(frameId);
			});
			scrollIntervals = [];
			scrollPositions = [];
		};
	});
</script>

	<div class="space-y-0 pb-0">
		{#each blocks as block, index}
			{@const isNotLast = index < blocks.length - 1}
			{@const borderClass = isNotLast ? 'border-b border-border' : ''}
			{@const commandArgs = block.command.replace(/^npx\s+/, '').split(' ')}
			<div
				bind:this={blockRefs[index]}
				class="grid grid-cols-1 lg:grid-cols-7 transition-all duration-700 ease-out -mx-8 {borderClass}"
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
						"lg:col-span-2 p-10 lg:p-12 lg:border-r text-right sticky top-20 border-border flex flex-col justify-between",
					)}
				>
					<div>
						<h3 class="text-2xl font-semibold mb-3 tracking-tight">{block.name}</h3>
						<p class="text-sm text-muted-foreground leading-relaxed">
							{block.description}
						</p>
					</div>
				</div>
				<div class="lg:col-span-5 relative">
					<div
						bind:this={previewRefs[index]}
						class={cn(
							"scroll-smooth scrollbar-hide",
							block.orientation === 'horizontal'
								? "overflow-x-auto pl-10 lg:pl-12 !pr-0 py-10 lg:py-12"
								: "overflow-y-auto px-10 lg:px-12"
						)}
					>
						{@render block.preview()}
					</div>
					{#if block.orientation === 'horizontal'}
						<!-- Left gradient -->
						<div class="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-background to-transparent pointer-events-none"></div>
						<!-- Right gradient -->
						<div class="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent pointer-events-none"></div>
					{:else}
						<!-- Top gradient -->
						<div class="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-background to-transparent pointer-events-none"></div>
						<!-- Bottom gradient -->
						<div class="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background to-transparent pointer-events-none"></div>
					{/if}
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