<script lang="ts">
	import MediaLightbox from './media-lightbox.svelte';

	interface Props {
		url: string | string[];
		type?: string;
		class?: string;
	}

	let { url, type, class: className = '' }: Props = $props();

	// Convert to array for consistent handling
	const mediaUrls = $derived(Array.isArray(url) ? url : [url]);

	let lightboxOpen = $state(false);
	let lightboxIndex = $state(0);

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
		lightboxIndex = index;
		lightboxOpen = true;
	}
</script>

<div class="w-full my-2 {className}" data-media-simple="">
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
</div>

<MediaLightbox {mediaItems} bind:open={lightboxOpen} initialIndex={lightboxIndex} />