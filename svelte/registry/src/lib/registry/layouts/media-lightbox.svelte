<script lang="ts">
	import { Dialog } from 'bits-ui';
	import ArrowLeft from '../icons/arrow-left/arrow-left.svelte';
	import ArrowRight from '../icons/arrow-right/arrow-right.svelte';
	import ZoomIn from '../icons/zoom-in/zoom-in.svelte';
	import ZoomOut from '../icons/zoom-out/zoom-out.svelte';
	import CancelIcon from '../icons/cancel/cancel.svelte';
	import { cn } from '../utils/cn';

	interface MediaItem {
		url: string;
		type: 'image' | 'video' | 'youtube';
		videoId?: string;
	}

	interface Props {
		mediaItems: MediaItem[];
		initialIndex?: number;
		open?: boolean;
		onClose?: () => void;
		class?: string;
	}

	let { mediaItems, initialIndex = 0, open = $bindable(false), onClose, class: className = '' }: Props = $props();

	let currentIndex = $state(initialIndex);
	let zoomLevel = $state(1);
	let panX = $state(0);
	let panY = $state(0);
	let isDragging = $state(false);
	let dragStartX = $state(0);
	let dragStartY = $state(0);
	let touchStartX = $state(0);
	let touchStartY = $state(0);
	let touchStartDistance = $state(0);

	const currentMedia = $derived(mediaItems[currentIndex]);
	const hasPrevious = $derived(currentIndex > 0);
	const hasNext = $derived(currentIndex < mediaItems.length - 1);
	const counter = $derived(`${currentIndex + 1} / ${mediaItems.length}`);

	$effect(() => {
		if (open) {
			currentIndex = initialIndex;
			resetZoom();
		}
	});

	function handleOpenChange(newOpen: boolean) {
		open = newOpen;
		if (!newOpen) {
			resetZoom();
			if (onClose) onClose();
		}
	}

	function navigatePrev() {
		if (hasPrevious) {
			currentIndex--;
			resetZoom();
		}
	}

	function navigateNext() {
		if (hasNext) {
			currentIndex++;
			resetZoom();
		}
	}

	function resetZoom() {
		zoomLevel = 1;
		panX = 0;
		panY = 0;
	}

	function zoomIn() {
		zoomLevel = Math.min(zoomLevel * 1.2, 5);
	}

	function zoomOut() {
		zoomLevel = Math.max(zoomLevel / 1.2, 1);
		if (zoomLevel === 1) {
			panX = 0;
			panY = 0;
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (!open) return;

		switch (e.key) {
			case 'ArrowLeft':
				e.preventDefault();
				navigatePrev();
				break;
			case 'ArrowRight':
				e.preventDefault();
				navigateNext();
				break;
		}
	}

	function handleWheel(e: WheelEvent) {
		if (!open || currentMedia.type !== 'image') return;
		e.preventDefault();

		if (e.deltaY < 0) {
			zoomIn();
		} else {
			zoomOut();
		}
	}

	function handleMouseDown(e: MouseEvent) {
		if (zoomLevel <= 1 || currentMedia.type !== 'image') return;
		isDragging = true;
		dragStartX = e.clientX - panX;
		dragStartY = e.clientY - panY;
	}

	function handleMouseMove(e: MouseEvent) {
		if (!isDragging) return;
		panX = e.clientX - dragStartX;
		panY = e.clientY - dragStartY;
	}

	function handleMouseUp() {
		isDragging = false;
	}

	function getTouchDistance(touches: TouchList): number {
		if (touches.length < 2) return 0;
		const dx = touches[0].clientX - touches[1].clientX;
		const dy = touches[0].clientY - touches[1].clientY;
		return Math.sqrt(dx * dx + dy * dy);
	}

	function handleTouchStart(e: TouchEvent) {
		if (currentMedia.type !== 'image') return;

		if (e.touches.length === 2) {
			touchStartDistance = getTouchDistance(e.touches);
		} else if (e.touches.length === 1) {
			touchStartX = e.touches[0].clientX;
			touchStartY = e.touches[0].clientY;
		}
	}

	function handleTouchMove(e: TouchEvent) {
		if (currentMedia.type !== 'image') return;

		if (e.touches.length === 2) {
			e.preventDefault();
			const currentDistance = getTouchDistance(e.touches);
			const scale = currentDistance / touchStartDistance;
			zoomLevel = Math.max(1, Math.min(5, zoomLevel * scale));
			touchStartDistance = currentDistance;
		} else if (e.touches.length === 1 && zoomLevel > 1) {
			e.preventDefault();
			const deltaX = e.touches[0].clientX - touchStartX;
			const deltaY = e.touches[0].clientY - touchStartY;
			panX += deltaX;
			panY += deltaY;
			touchStartX = e.touches[0].clientX;
			touchStartY = e.touches[0].clientY;
		}
	}

	function handleTouchEnd(e: TouchEvent) {
		if (currentMedia.type !== 'image') return;

		if (e.changedTouches.length === 1 && e.touches.length === 0 && zoomLevel === 1) {
			const deltaX = e.changedTouches[0].clientX - touchStartX;
			const deltaY = Math.abs(e.changedTouches[0].clientY - touchStartY);

			if (deltaY < 50) {
				if (deltaX > 100 && hasPrevious) {
					navigatePrev();
				} else if (deltaX < -100 && hasNext) {
					navigateNext();
				}
			}
		}

		if (e.touches.length === 0) {
			touchStartDistance = 0;
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} onmouseup={handleMouseUp} onmousemove={handleMouseMove} />

<Dialog.Root {open} onOpenChange={handleOpenChange}>
	<Dialog.Portal>
		<Dialog.Overlay
			class="fixed inset-0 z-[9998] bg-black/95 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
		/>
		<Dialog.Content
			class={cn(
				'fixed inset-0 z-[9999] flex items-center justify-center',
				'data-[state=open]:animate-in data-[state=closed]:animate-out',
				'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
				'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
				className
			)}
		>
			<div class="relative w-full h-full flex items-center justify-center p-4 md:p-8">
				<!-- Media Display -->
				<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
				<div
					class="relative w-full h-full flex items-center justify-center overflow-hidden"
					onwheel={handleWheel}
					onmousedown={handleMouseDown}
					ontouchstart={handleTouchStart}
					ontouchmove={handleTouchMove}
					ontouchend={handleTouchEnd}
					role="img"
					tabindex="-1"
				>
					{#if currentMedia.type === 'image'}
						<img
							src={currentMedia.url}
							alt=""
							class="max-w-full max-h-full object-contain transition-transform duration-200 select-none"
							style="transform: scale({zoomLevel}) translate({panX / zoomLevel}px, {panY / zoomLevel}px); cursor: {zoomLevel > 1 ? 'grab' : 'default'};"
							draggable="false"
						/>
					{:else if currentMedia.type === 'video'}
						<!-- svelte-ignore a11y_media_has_caption -->
						<video
							src={currentMedia.url}
							controls
							class="max-w-full max-h-full object-contain"
						></video>
					{:else if currentMedia.type === 'youtube' && currentMedia.videoId}
						<iframe
							src="https://www.youtube.com/embed/{currentMedia.videoId}"
							title="YouTube video"
							class="w-full h-full max-w-5xl max-h-[80vh] aspect-video"
							frameborder="0"
							allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
							allowfullscreen
						></iframe>
					{/if}
				</div>

				<!-- Close Button -->
				<Dialog.Close
					class="absolute right-4 top-4 rounded-full bg-black/50 p-2 text-white opacity-70 ring-offset-background transition-opacity hover:opacity-100 hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none z-[10000]"
				>
					<CancelIcon class="h-6 w-6" />
					<span class="sr-only">Close</span>
				</Dialog.Close>

				<!-- Counter -->
				{#if mediaItems.length > 1}
					<div
						class="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm font-medium z-[10000]"
					>
						{counter}
					</div>
				{/if}

				<!-- Navigation Buttons -->
				{#if mediaItems.length > 1}
					{#if hasPrevious}
						<button
							onclick={navigatePrev}
							class="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 z-[10000]"
							aria-label="Previous"
						>
							<ArrowLeft class="h-6 w-6" />
						</button>
					{/if}

					{#if hasNext}
						<button
							onclick={navigateNext}
							class="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 z-[10000]"
							aria-label="Next"
						>
							<ArrowRight class="h-6 w-6" />
						</button>
					{/if}
				{/if}

				<!-- Zoom Controls -->
				{#if currentMedia.type === 'image'}
					<div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-[10000]">
						<button
							onclick={zoomOut}
							class="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-30 disabled:cursor-not-allowed"
							disabled={zoomLevel <= 1}
							aria-label="Zoom out"
						>
							<ZoomOut class="h-5 w-5" />
						</button>
						<div class="bg-black/50 text-white px-3 py-2 rounded-full text-sm font-medium">
							{Math.round(zoomLevel * 100)}%
						</div>
						<button
							onclick={zoomIn}
							class="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-30 disabled:cursor-not-allowed"
							disabled={zoomLevel >= 5}
							aria-label="Zoom in"
						>
							<ZoomIn class="h-5 w-5" />
						</button>
					</div>
				{/if}
			</div>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
