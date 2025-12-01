<script lang="ts">
	import { ArrowLeft01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons';
	import { HugeiconsIcon } from '@hugeicons/svelte';

	interface Props {
		url: string | string[];
		class?: string;
	}

	let { url, class: className = '' }: Props = $props();

	// Normalize to array
	const urls = $derived(Array.isArray(url) ? url : [url]);
	let currentIndex = $state(0);

	const goToPrevious = () => {
		currentIndex = currentIndex === 0 ? urls.length - 1 : currentIndex - 1;
	};

	const goToNext = () => {
		currentIndex = currentIndex === urls.length - 1 ? 0 : currentIndex + 1;
	};

	const goToSlide = (index: number) => {
		currentIndex = index;
	};

	// Keyboard navigation
	const handleKeydown = (e: KeyboardEvent) => {
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
	class="carousel-container {className}"
	onkeydown={handleKeydown}
	tabindex="0"
	role="region"
	aria-label="Media carousel"
>
	<div class="carousel-viewport">
		<div
			class="carousel-track"
			style="transform: translateX({-currentIndex * 100}%)"
		>
			{#each urls as mediaUrl, i (i)}
				<div class="carousel-slide">
					{#if mediaUrl.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i)}
						<img src={mediaUrl} alt="" class="carousel-image" />
					{:else if mediaUrl.match(/\.(mp4|webm|mov)(\?|$)/i)}
						<!-- svelte-ignore a11y_media_has_caption -->
						<video src={mediaUrl} controls class="carousel-video"></video>
					{:else if mediaUrl.match(/youtube\.com|youtu\.be/i)}
						{@const videoId = mediaUrl.match(
							/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
						)?.[1]}
						{#if videoId}
							<iframe
								src="https://www.youtube.com/embed/{videoId}"
								title="YouTube video"
								class="carousel-youtube"
								frameborder="0"
								allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
								allowfullscreen
							></iframe>
						{/if}
					{/if}
				</div>
			{/each}
		</div>

		{#if urls.length > 1}
			<!-- Navigation buttons -->
			<button
				class="carousel-button carousel-button-prev"
				onclick={goToPrevious}
				aria-label="Previous slide"
			>
				<HugeiconsIcon icon={ArrowLeft01Icon} size={24} />
			</button>
			<button
				class="carousel-button carousel-button-next"
				onclick={goToNext}
				aria-label="Next slide"
			>
				<HugeiconsIcon icon={ArrowRight01Icon} size={24} />
			</button>

			<!-- Counter overlay -->
			<div class="carousel-counter">
				{currentIndex + 1} / {urls.length}
			</div>

			<!-- Dot indicators -->
			<div class="carousel-dots">
				{#each urls as _, i (i)}
					<button
						class="carousel-dot {i === currentIndex ? 'active' : ''}"
						onclick={() => goToSlide(i)}
						aria-label="Go to slide {i + 1}"
					></button>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	.carousel-container {
		position: relative;
		width: 100%;
		max-width: 800px;
		margin: 0.5rem 0;
		border-radius: 0.75rem;
		overflow: hidden;
		background: var(--muted);
	}

	.carousel-container:focus {
		outline: 2px solid var(--primary);
		outline-offset: 2px;
	}

	.carousel-viewport {
		position: relative;
		width: 100%;
		overflow: hidden;
	}

	.carousel-track {
		display: flex;
		width: 100%;
		transition: transform 0.5s ease-out;
	}

	.carousel-slide {
		min-width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.carousel-image,
	.carousel-video,
	.carousel-youtube {
		width: 100%;
		height: auto;
		max-height: 600px;
		object-fit: contain;
	}

	.carousel-youtube {
		aspect-ratio: 16 / 9;
	}

	.carousel-button {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		background: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(4px);
		border: none;
		border-radius: 50%;
		width: 48px;
		height: 48px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		cursor: pointer;
		transition: all 0.2s;
		z-index: 10;
	}

	.carousel-button:hover {
		background: rgba(0, 0, 0, 0.8);
		transform: translateY(-50%) scale(1.1);
	}

	.carousel-button-prev {
		left: 1rem;
	}

	.carousel-button-next {
		right: 1rem;
	}

	.carousel-counter {
		position: absolute;
		top: 1rem;
		right: 1rem;
		background: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(4px);
		color: white;
		padding: 0.5rem 0.75rem;
		border-radius: 1rem;
		font-size: 0.875rem;
		font-weight: 600;
		z-index: 10;
	}

	.carousel-dots {
		position: absolute;
		bottom: 1rem;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		gap: 0.5rem;
		z-index: 10;
	}

	.carousel-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		border: 2px solid white;
		background: rgba(255, 255, 255, 0.3);
		backdrop-filter: blur(4px);
		cursor: pointer;
		transition: all 0.2s;
		padding: 0;
	}

	.carousel-dot:hover {
		transform: scale(1.2);
		background: rgba(255, 255, 255, 0.5);
	}

	.carousel-dot.active {
		background: white;
		width: 24px;
		border-radius: 4px;
	}
</style>
