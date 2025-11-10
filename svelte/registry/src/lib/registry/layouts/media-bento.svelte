<script lang="ts">
	import MediaLightbox from './media-lightbox.svelte';

	interface Props {
		url: string | string[];
		class?: string;
	}

	let { url, class: className = '' }: Props = $props();

	let lightboxOpen = $state(false);
	let selectedIndex = $state(0);

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
		selectedIndex = index;
		lightboxOpen = true;
	}
</script>

<div class="grid gap-[2px] my-2 w-full max-w-full rounded-xl overflow-clip {gridClass} {className}">
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
				<video src={mediaUrl} class="w-full h-full object-cover pointer-events-none"></video>
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

<MediaLightbox {mediaItems} bind:open={lightboxOpen} initialIndex={selectedIndex} />
