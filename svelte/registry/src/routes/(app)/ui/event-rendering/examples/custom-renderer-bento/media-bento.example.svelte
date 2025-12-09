<script lang="ts">
	interface Props {
		url: string | string[];
		class?: string;
	}

	let { url, class: className = '' }: Props = $props();

	// Normalize to array
	const urls = $derived(Array.isArray(url) ? url : [url]);
	const count = $derived(urls.length);

	// Determine grid layout based on count
	const gridClass = $derived.by(() => {
		if (count === 1) return 'bento-single';
		if (count === 2) return 'bento-pair';
		if (count === 3) return 'bento-triple';
		if (count === 4) return 'bento-quad';
		return 'bento-many';
	});

	// Determine which items get special sizing for asymmetric layouts
	const getItemClass = (index: number) => {
		if (count === 3 && index === 0) return 'bento-item-large';
		if (count === 4) return 'bento-item-equal';
		if (count >= 5 && index === 0) return 'bento-item-featured';
		return 'bento-item';
	};
</script>

<div class="bento-grid {gridClass} {className}">
	{#each urls as mediaUrl, i (i)}
		<div class="bento-cell {getItemClass(i)}">
			{#if mediaUrl.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i)}
				<img src={mediaUrl} alt="" class="bento-image" />
			{:else if mediaUrl.match(/\.(mp4|webm|mov)(\?|$)/i)}
				<!-- svelte-ignore a11y_media_has_caption -->
				<video src={mediaUrl} controls class="bento-video"></video>
			{:else if mediaUrl.match(/youtube\.com|youtu\.be/i)}
				{@const videoId = mediaUrl.match(
					/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
				)?.[1]}
				{#if videoId}
					<iframe
						src="https://www.youtube.com/embed/{videoId}"
						title="YouTube video"
						class="bento-youtube"
						frameborder="0"
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
						allowfullscreen
					></iframe>
				{/if}
			{/if}
		</div>
	{/each}
</div>

<style>
	.bento-grid {
		display: grid;
		gap: 0.5rem;
		margin: 0.5rem 0;
		width: 100%;
		max-width: 100%;
	}

	/* Single image - full width */
	.bento-single {
		grid-template-columns: 1fr;
	}

	/* Two images - side by side */
	.bento-pair {
		grid-template-columns: repeat(2, 1fr);
	}

	/* Three images - asymmetric: 1 large left, 2 stacked right */
	.bento-triple {
		grid-template-columns: 2fr 1fr;
		grid-template-rows: repeat(2, 1fr);
	}

	/* Four images - 2x2 grid */
	.bento-quad {
		grid-template-columns: repeat(2, 1fr);
		grid-template-rows: repeat(2, 1fr);
	}

	/* Five+ images - Pinterest/masonry style */
	.bento-many {
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		grid-auto-rows: 200px;
		grid-auto-flow: dense;
	}

	.bento-cell {
		position: relative;
		overflow: hidden;
		border-radius: 0.75rem;
		background: var(--muted);
		transition: transform 0.2s, box-shadow 0.2s;
	}

	.bento-cell:hover {
		transform: scale(1.02);
		box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
		z-index: 1;
	}

	/* Asymmetric layouts */
	.bento-item-large {
		grid-row: span 2;
	}

	.bento-item-equal {
		aspect-ratio: 1;
	}

	.bento-item-featured {
		grid-column: span 2;
		grid-row: span 2;
	}

	.bento-image,
	.bento-video,
	.bento-youtube {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.bento-youtube {
		aspect-ratio: 16 / 9;
	}

	/* Responsive adjustments */
	@media (max-width: 640px) {
		.bento-pair,
		.bento-triple,
		.bento-quad {
			grid-template-columns: 1fr;
		}

		.bento-item-large,
		.bento-item-featured {
			grid-row: span 1;
			grid-column: span 1;
		}

		.bento-many {
			grid-template-columns: repeat(2, 1fr);
		}
	}
</style>
