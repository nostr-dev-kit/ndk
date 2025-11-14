<script lang="ts">
	import type { NDKEvent } from '@nostr-dev-kit/ndk';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import { Motion } from 'svelte-motion';
	import { ArrowLeft01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { ViewOffIcon } from '@hugeicons/core-free-icons';
	import MediaLightbox from '$lib/registry/components/media-lightbox/media-lightbox.svelte';
	import { createMediaRender } from '$lib/registry/builders/media-render/index.svelte.js';

	interface Props {
		url: string[];
		event?: NDKEvent;
		ndk?: NDKSvelte;
		onclick?: (urls: string[], clickedIndex: number) => void;
		class?: string;
	}

	let { url, event, ndk, onclick, class: className = '' }: Props = $props();

	// url is always an array now
	const urls = $derived(url);
	let currentIndex = $state(0);
	let lightboxOpen = $state(false);
	let lightboxIndex = $state(0);

	// Use media render builder for blur/NSFW logic
	const mediaState = createMediaRender(() => ({ event }), ndk);

	// Parse media items for lightbox
	const mediaItems = $derived(
		urls.map((mediaUrl) => {
			if (mediaUrl.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i)) {
				return { url: mediaUrl, type: 'image' as const };
			} else if (mediaUrl.match(/\.(mp4|webm|mov)(\?|$)/i)) {
				return { url: mediaUrl, type: 'video' as const };
			} else if (mediaUrl.match(/youtube\.com|youtu\.be/i)) {
				const videoId = mediaUrl.match(
					/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
				)?.[1];
				return { url: mediaUrl, type: 'youtube' as const, videoId };
			}
			return { url: mediaUrl, type: 'image' as const };
		})
	);

	const goToPrevious = () => {
		currentIndex = currentIndex === 0 ? urls.length - 1 : currentIndex - 1;
	};

	const goToNext = () => {
		currentIndex = currentIndex === urls.length - 1 ? 0 : currentIndex + 1;
	};

	const goToSlide = (index: number) => {
		currentIndex = index;
	};

	const openLightbox = (index: number) => {
		// If onclick callback is provided, call it and skip lightbox
		if (onclick) {
			onclick(urls, index);
			return;
		}
		// Otherwise, open lightbox
		lightboxIndex = index;
		lightboxOpen = true;
	};

	// Keyboard navigation
	const handleKeydown = (e: KeyboardEvent) => {
		if (lightboxOpen) return; // Don't handle keys when lightbox is open

		// Handle blur reveal
		if (mediaState.shouldBlur && !mediaState.showMedia) {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				mediaState.reveal();
				return;
			}
		}

		// Handle carousel navigation
		if (e.key === 'ArrowLeft') {
			goToPrevious();
		} else if (e.key === 'ArrowRight') {
			goToNext();
		}
	};
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
	class="relative w-full max-w-3xl my-2 rounded-xl overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 {className}"
	onkeydown={handleKeydown}
	tabindex="0"
	role="region"
	aria-label="Media carousel"
	data-media-carousel=""
>
	{#if mediaState.shouldBlur && !mediaState.showMedia}
		<!-- Blurred overlay -->
		<div class="relative">
			<!-- Blurred media preview -->
			<div class="blur-xl opacity-50">
				<div class="relative w-full overflow-hidden">
					<div class="flex w-full">
						{#each urls as mediaUrl, i (i)}
							<div class="min-w-full flex items-center justify-center">
								{#if mediaUrl.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i)}
									<img
										src={mediaUrl}
										alt=""
										class="w-full h-auto max-h-[600px] object-contain"
									/>
								{:else if mediaUrl.match(/\.(mp4|webm|mov)(\?|$)/i)}
									<!-- svelte-ignore a11y_media_has_caption -->
									<video src={mediaUrl} class="w-full h-auto max-h-[600px] object-contain"
									></video>
								{:else if mediaUrl.match(/youtube\.com|youtu\.be/i)}
									{@const videoId = mediaUrl.match(
										/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
									)?.[1]}
									{#if videoId}
										<iframe
											src="https://www.youtube.com/embed/{videoId}"
											title="YouTube video"
											class="w-full aspect-video"
											frameborder="0"
											allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
											allowfullscreen
										></iframe>
									{/if}
								{/if}
							</div>
						{/each}
					</div>
				</div>
			</div>

			<!-- Overlay with reveal button -->
			<button
				class="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm rounded-lg cursor-pointer transition-all hover:bg-black/70 group"
				onclick={mediaState.reveal}
				aria-label="Reveal media content"
			>
				<HugeiconsIcon
					icon={ViewOffIcon}
					className="w-12 h-12 text-white/80 mb-2 group-hover:scale-110 transition-transform"
				/>
				<span class="text-white font-medium text-lg mb-1">Click to view</span>
				<span class="text-white/70 text-sm px-4 text-center">
					{mediaState.blurReason}
				</span>
			</button>
		</div>
	{:else}
		<!-- Unblurred media -->
		<div class="relative w-full overflow-hidden">
			<Motion
				animate={{ x: -currentIndex * 100 + '%' }}
				transition={{ type: 'spring', stiffness: 300, damping: 30 }}
				let:motion
			>
				<div use:motion class="flex w-full">
					{#each urls as mediaUrl, i (i)}
						<button
							type="button"
							onclick={() => openLightbox(i)}
							class="min-w-full flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
						>
							{#if mediaUrl.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i)}
								<img
									src={mediaUrl}
									alt=""
									class="w-full h-auto max-h-[600px] object-contain pointer-events-none"
								/>
							{:else if mediaUrl.match(/\.(mp4|webm|mov)(\?|$)/i)}
								<!-- svelte-ignore a11y_media_has_caption -->
								<video
									src={mediaUrl}
									class="w-full h-auto max-h-[600px] object-contain pointer-events-none"
								></video>
							{:else if mediaUrl.match(/youtube\.com|youtu\.be/i)}
								{@const videoId = mediaUrl.match(
									/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
								)?.[1]}
								{#if videoId}
									<iframe
										src="https://www.youtube.com/embed/{videoId}"
										title="YouTube video"
										class="w-full aspect-video pointer-events-none"
										frameborder="0"
										allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
										allowfullscreen
									></iframe>
								{/if}
							{/if}
						</button>
					{/each}
				</div>
			</Motion>

			{#if urls.length > 1}
				<!-- Navigation buttons -->
				<button
					class="absolute top-1/2 left-4 -translate-y-1/2 bg-black/60 backdrop-blur-sm border-0 rounded-full w-12 h-12 flex items-center justify-center text-white cursor-pointer transition-all hover:bg-black/80 hover:scale-110 z-10"
					onclick={goToPrevious}
					aria-label="Previous slide"
				>
					<HugeiconsIcon icon={ArrowLeft01Icon} size={24} />
				</button>
				<button
					class="absolute top-1/2 right-4 -translate-y-1/2 bg-black/60 backdrop-blur-sm border-0 rounded-full w-12 h-12 flex items-center justify-center text-white cursor-pointer transition-all hover:bg-black/80 hover:scale-110 z-10"
					onclick={goToNext}
					aria-label="Next slide"
				>
					<HugeiconsIcon icon={ArrowRight01Icon} size={24} />
				</button>

				<!-- Counter overlay -->
				<div
					class="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-2 rounded-2xl text-sm font-semibold z-10"
				>
					{currentIndex + 1} / {urls.length}
				</div>

				<!-- Dot indicators -->
				<div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
					{#each urls as _, i (i)}
						<button
							class="w-2 h-2 rounded-full border-2 border-white bg-white/30 backdrop-blur-sm cursor-pointer transition-all hover:scale-125 hover:bg-white/50 p-0 {i ===
							currentIndex
								? 'bg-white w-6 rounded'
								: ''}"
							onclick={() => goToSlide(i)}
							aria-label="Go to slide {i + 1}"
						></button>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>

<MediaLightbox {mediaItems} bind:open={lightboxOpen} initialIndex={lightboxIndex} />
