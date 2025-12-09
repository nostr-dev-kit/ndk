<script lang="ts">
	import type { NDKEvent } from '@nostr-dev-kit/ndk';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import MediaLightbox from '$lib/registry/components/media-lightbox/media-lightbox.svelte';
	import { createMediaRender } from '$lib/registry/builders/media-render/index.svelte.js';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { ViewOffIcon } from '@hugeicons/core-free-icons';

	interface Props {
		url: string[];
		event?: NDKEvent;
		ndk?: NDKSvelte;
		type?: string;
		onclick?: (urls: string[], clickedIndex: number) => void;
		class?: string;
	}

	let { url, event, ndk, type, onclick, class: className = '' }: Props = $props();

	// url is always an array now
	const mediaUrls = $derived(url);

	let lightboxOpen = $state(false);
	let lightboxIndex = $state(0);

	// Use media render builder for blur/NSFW logic
	const mediaState = createMediaRender(() => ({ event }), ndk);

	function detectMediaType(mediaUrl: string) {
		const isImage = mediaUrl.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i);
		const isVideo = mediaUrl.match(/\.(mp4|webm|mov)(\?|$)/i);
		const isYouTube = mediaUrl.match(/youtube\.com|youtu\.be/i);

		let videoId = null;
		if (isYouTube) {
			const match = mediaUrl.match(
				/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
			);
			videoId = match?.[1] || null;
		}

		return { isImage, isVideo, isYouTube, videoId };
	}

	// Parse media items for lightbox
	const mediaItems = $derived(
		mediaUrls.map((mediaUrl) => {
			const { isImage, isVideo, isYouTube, videoId } = detectMediaType(mediaUrl);
			if (isImage) {
				return { url: mediaUrl, type: 'image' as const };
			} else if (isVideo) {
				return { url: mediaUrl, type: 'video' as const };
			} else if (isYouTube && videoId) {
				return { url: mediaUrl, type: 'youtube' as const, videoId };
			}
			return { url: mediaUrl, type: 'image' as const };
		})
	);

	function openLightbox(index: number) {
		// If onclick callback is provided, call it and skip lightbox
		if (onclick) {
			onclick(mediaUrls, index);
			return;
		}
		// Otherwise, open lightbox
		lightboxIndex = index;
		lightboxOpen = true;
	}

	function handleKeyPress(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			mediaState.reveal();
		}
	}
</script>

<div class="relative w-full my-2 {className}" data-media-basic="">
	{#if mediaState.shouldBlur && !mediaState.showMedia}
		<!-- Blurred overlay -->
		<div class="relative">
			<!-- Blurred media preview -->
			<div class="blur-xl opacity-50">
				{#each mediaUrls as mediaUrl, i}
					{@const { isImage, isVideo, isYouTube, videoId } = detectMediaType(mediaUrl)}
					{#if isImage}
						<div class="block w-full mb-2">
							<img
								src={mediaUrl}
								alt=""
								class="w-full h-auto max-h-[600px] object-contain rounded-lg"
								loading="lazy"
							/>
						</div>
					{:else if isVideo}
						<div class="block w-full mb-2">
							<!-- svelte-ignore a11y_media_has_caption -->
							<video
								src={mediaUrl}
								class="w-full h-auto max-h-[600px] object-contain rounded-lg"
							></video>
						</div>
					{:else if isYouTube && videoId}
						<div class="block w-full mb-2">
							<iframe
								src="https://www.youtube.com/embed/{videoId}"
								title="YouTube video"
								class="w-full aspect-video rounded-lg"
								frameborder="0"
								allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
								allowfullscreen
							></iframe>
						</div>
					{/if}
				{/each}
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
		{#each mediaUrls as mediaUrl, i}
			{@const { isImage, isVideo, isYouTube, videoId } = detectMediaType(mediaUrl)}
			{#if isImage}
				<button
					type="button"
					onclick={() => openLightbox(i)}
					class="block w-full mb-2 cursor-pointer hover:opacity-90 transition-opacity"
				>
					<img
						src={mediaUrl}
						alt=""
						class="w-full h-auto max-h-[600px] object-contain rounded-lg pointer-events-none"
						loading="lazy"
					/>
				</button>
			{:else if isVideo}
				<button
					type="button"
					onclick={() => openLightbox(i)}
					class="block w-full mb-2 cursor-pointer hover:opacity-90 transition-opacity"
				>
					<!-- svelte-ignore a11y_media_has_caption -->
					<video
						src={mediaUrl}
						class="w-full h-auto max-h-[600px] object-contain rounded-lg pointer-events-none"
					></video>
				</button>
			{:else if isYouTube && videoId}
				<button
					type="button"
					onclick={() => openLightbox(i)}
					class="block w-full mb-2 cursor-pointer hover:opacity-90 transition-opacity"
					aria-label="Open YouTube video in lightbox"
				>
					<iframe
						src="https://www.youtube.com/embed/{videoId}"
						title="YouTube video"
						class="w-full aspect-video rounded-lg pointer-events-none"
						frameborder="0"
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
						allowfullscreen
					></iframe>
				</button>
			{:else}
				<!-- Fallback for unknown media types -->
				<a
					href={mediaUrl}
					target="_blank"
					rel="noopener noreferrer"
					class="block p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors mb-2"
				>
					<span class="text-sm text-muted-foreground">View media: {mediaUrl}</span>
				</a>
			{/if}
		{/each}
	{/if}
</div>

<MediaLightbox {mediaItems} bind:open={lightboxOpen} initialIndex={lightboxIndex} />
