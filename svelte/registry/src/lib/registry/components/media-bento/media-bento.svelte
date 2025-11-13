<script lang="ts">
	import type { NDKEvent } from '@nostr-dev-kit/ndk';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import MediaLightbox from '$lib/registry/components/media-lightbox/media-lightbox.svelte';
	import { createMediaRender } from '$lib/registry/builders/media-render/index.svelte.js';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { ViewOffIcon } from '@hugeicons/core-free-icons';

	interface Props {
		url: string | string[];
		event?: NDKEvent;
		ndk?: NDKSvelte;
		onclick?: (url: string | string[]) => void;
		class?: string;
	}

	let { url, event, ndk, onclick, class: className = '' }: Props = $props();

	let lightboxOpen = $state(false);
	let selectedIndex = $state(0);

	// Use media render builder for blur/NSFW logic
	const mediaState = createMediaRender(() => ({ event }), ndk);

	// Normalize to array
	const urls = $derived(Array.isArray(url) ? url : [url]);
	const count = $derived(urls.length);

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

	// Determine grid layout based on count
	const gridClass = $derived.by(() => {
		if (count === 1) return 'grid-cols-1';
		if (count === 2) return 'grid-cols-2';
		if (count === 3) return 'grid-cols-2 grid-rows-2';
		if (count === 4) return 'grid-cols-2 grid-rows-2';
		return 'grid-cols-[repeat(auto-fill,minmax(200px,1fr))] auto-rows-[200px]';
	});

	// Determine which items get special sizing for asymmetric layouts
	const getItemClass = (index: number) => {
		if (count === 3 && index === 0) return 'row-span-2';
		if (count === 4) return 'aspect-square';
		if (count >= 5 && index === 0) return 'col-span-2 row-span-2';
		return '';
	};

	function openLightbox(index: number) {
		// If onclick callback is provided, call it and skip lightbox
		if (onclick) {
			onclick(url);
			return;
		}
		// Otherwise, open lightbox
		selectedIndex = index;
		lightboxOpen = true;
	}

	function handleKeyPress(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			mediaState.reveal();
		}
	}
</script>

<div class="relative w-full my-2 {className}" data-media-bento="">
	{#if mediaState.shouldBlur && !mediaState.showMedia}
		<!-- Blurred overlay -->
		<div class="relative">
			<!-- Blurred media preview -->
			<div class="blur-xl opacity-50">
				<div
					class="grid gap-[2px] w-full max-w-full rounded-xl overflow-clip {gridClass}"
				>
					{#each urls as mediaUrl, i (i)}
						<div
							class="relative overflow-hidden bg-muted {getItemClass(i)}"
						>
							{#if mediaUrl.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i)}
								<img src={mediaUrl} alt="" class="w-full h-full object-cover" />
							{:else if mediaUrl.match(/\.(mp4|webm|mov)(\?|$)/i)}
								<!-- svelte-ignore a11y_media_has_caption -->
								<video src={mediaUrl} class="w-full h-full object-cover"></video>
							{:else if mediaUrl.match(/youtube\.com|youtu\.be/i)}
								{@const videoId = mediaUrl.match(
									/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
								)?.[1]}
								{#if videoId}
									<iframe
										src="https://www.youtube.com/embed/{videoId}"
										title="YouTube video"
										class="w-full h-full aspect-video"
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

			<!-- Overlay with reveal button -->
			<button
				class="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm rounded-lg cursor-pointer transition-all hover:bg-black/70 group"
				onclick={mediaState.reveal}
				onkeypress={handleKeyPress}
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
		<div class="grid gap-[2px] w-full max-w-full rounded-xl overflow-clip {gridClass}">
			{#each urls as mediaUrl, i (i)}
				<button
					type="button"
					onclick={() => openLightbox(i)}
					class="relative overflow-hidden bg-muted transition-all cursor-pointer hover:opacity-90 {getItemClass(
						i
					)}"
				>
					{#if mediaUrl.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i)}
						<img src={mediaUrl} alt="" class="w-full h-full object-cover pointer-events-none" />
					{:else if mediaUrl.match(/\.(mp4|webm|mov)(\?|$)/i)}
						<!-- svelte-ignore a11y_media_has_caption -->
						<video controls src={mediaUrl} class="w-full h-full object-cover"></video>
					{:else if mediaUrl.match(/youtube\.com|youtu\.be/i)}
						{@const videoId = mediaUrl.match(
							/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
						)?.[1]}
						{#if videoId}
							<iframe
								src="https://www.youtube.com/embed/{videoId}"
								title="YouTube video"
								class="w-full h-full aspect-video pointer-events-none"
								frameborder="0"
								allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
								allowfullscreen
							></iframe>
						{/if}
					{/if}
				</button>
			{/each}
		</div>
	{/if}
</div>

<MediaLightbox {mediaItems} bind:open={lightboxOpen} initialIndex={selectedIndex} />
