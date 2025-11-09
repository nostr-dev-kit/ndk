<script lang="ts">
	import { Dialog } from 'bits-ui';
	import ComponentCard from '$site-components/ComponentCard.svelte';
    import { cn } from '$lib/registry/utils/cn.js';

	import type { ShowcaseComponent } from '$lib/site/templates/types';

	interface Props {
		components: ShowcaseComponent[];
		class?: string;
	}

	let {
		components,
		class: className = ''
	}: Props = $props();

	let activeComponentIndex = $state<number | null>(null);
	let componentRefs: HTMLDivElement[] = [];
	let previewRefs: HTMLDivElement[] = [];
	let scrollIntervals: number[] = [];
	let scrollPositions: number[] = [];

	// Modal state
	let showModal = $state(false);
	let selectedComponent = $state<ShowcaseComponent | null>(null);

	function handleComponentClick(component: ShowcaseComponent) {
		selectedComponent = component;
		showModal = true;
	}

	$effect(() => {
		if (typeof window === 'undefined') return;

		const updateActiveComponent = () => {
			const viewportCenter = window.innerHeight / 2;
			let closestIndex: number | null = null;
			let minDistance = Infinity;

			componentRefs.forEach((ref, index) => {
				if (!ref) return;
				const rect = ref.getBoundingClientRect();
				const componentCenter = rect.top + rect.height / 2;
				const distance = Math.abs(componentCenter - viewportCenter);

				if (distance < minDistance) {
					minDistance = distance;
					closestIndex = index;
				}
			});

			activeComponentIndex = closestIndex;
		};

		updateActiveComponent();
		window.addEventListener('scroll', updateActiveComponent, { passive: true });
		window.addEventListener('resize', updateActiveComponent, { passive: true });

		return () => {
			window.removeEventListener('scroll', updateActiveComponent);
			window.removeEventListener('resize', updateActiveComponent);
		};
	});

	// Auto-scroll effect for inactive preview areas
	$effect(() => {
		if (typeof window === 'undefined') return;

		// Initialize scroll positions
		scrollPositions = components.map(() => 0);

		const animateScroll = (index: number) => {
			const container = previewRefs[index];
			const component = components[index];
			if (!container || !component) return;

			const isActive = activeComponentIndex === index;
			const isHorizontal = component.orientation === 'horizontal';

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

		// Start animation for each component
		components.forEach((_, index) => {
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
		{#each components as component, index (component.cardData.name)}
			{@const isNotLast = index < components.length - 1}
			{@const borderClass = isNotLast ? 'border-b border-border' : ''}
			<div
				bind:this={componentRefs[index]}
				class="grid grid-cols-1 lg:grid-cols-7 transition-all duration-700 ease-out -mx-8 cursor-pointer {borderClass}"
				style:filter={activeComponentIndex !== index ? 'grayscale(1)' : 'grayscale(0)'}
				style:opacity={activeComponentIndex !== index ? '0.6' : '1'}
				role="button"
				tabindex="0"
				onclick={() => handleComponentClick(component)}
				onkeydown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault();
						handleComponentClick(component);
					}
				}}
				onmouseenter={() => (activeComponentIndex = index)}
			>
				<div
					class={cn(
						"lg:col-span-2 p-8 text-right sticky top-20 border-border flex flex-col justify-between gap-6 min-h-[233px]",
					)}
				>
					<div class="">
						<h3 class="text-xl font-semibold tracking-tight">{component.cardData.title}</h3>
						{#if component.cardData.oneLiner}
							<p class="text-sm text-muted-foreground leading-relaxed">
								{component.cardData.oneLiner}
							</p>
						{/if}
					</div>
					{#if component.control}
						<div onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()} role="presentation">
							{@render component.control()}
						</div>
					{/if}
				</div>
				<div class="lg:col-span-5 relative flex items-center">
					<div
						bind:this={previewRefs[index]}
						class={cn(
							"scroll-smooth scrollbar-hide",
							component.orientation === 'horizontal'
								? "overflow-x-auto pl-8 !pr-0 py-8"
								: "overflow-y-auto px-8"
						)}
					>
						<div
							class={cn(
								component.orientation === 'horizontal' ? "px-8" : "py-8"
							)}
							onclick={(e) => e.stopPropagation()}
							onkeydown={(e) => e.stopPropagation()}
							role="presentation"
						>
							{@render component.preview()}
						</div>
					</div>
					{#if component.orientation === 'horizontal'}
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
	<Dialog.Root bind:open={showModal}>
		<Dialog.Portal>
			<Dialog.Overlay class="fixed inset-0 z-[9998] bg-background/80 backdrop-blur-sm" />
			<Dialog.Content
				class="fixed left-[50%] top-[50%] z-[9999] w-[95%] max-w-[1200px] max-h-[95vh] translate-x-[-50%] translate-y-[-50%] overflow-y-auto rounded-xl bg-background"
			>
				<div class="absolute top-6 right-6 z-10">
					<Dialog.Close class="p-2 border-none bg-transparent cursor-pointer rounded-md transition-colors text-muted-foreground hover:bg-accent hover:text-accent-foreground">
						<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" ></path>
						</svg>
						<span class="sr-only">Close</span>
					</Dialog.Close>
				</div>

				<div class="p-8">
					<ComponentCard
						data={selectedComponent?.cardData ?? null}
						preview={selectedComponent?.preview}
					/>
				</div>
			</Dialog.Content>
		</Dialog.Portal>
	</Dialog.Root>