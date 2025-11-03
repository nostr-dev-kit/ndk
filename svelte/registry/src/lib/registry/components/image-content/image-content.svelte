<!-- @ndk-version: image-content@0.1.0 -->
<script lang="ts">
	import type { NDKImage } from '@nostr-dev-kit/ndk';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import type { NDKImetaTag } from '@nostr-dev-kit/ndk';
	import { getNDKFromContext } from '../../utils/ndk-context.svelte.js';
	import { Image01Icon } from '@hugeicons/core-free-icons';
	import { HugeiconsIcon } from '@hugeicons/svelte';

	interface Props {
		ndk?: NDKSvelte;
		image: NDKImage;
		showMeta?: boolean;
		showAlt?: boolean;
		class?: string;
		imageClass?: string;
	}

	let {
		ndk: providedNdk,
		image,
		showMeta = true,
		showAlt = true,
		class: className = '',
		imageClass = ''
	}: Props = $props();

	const imetas = $derived(image.imetas);
	const hasImages = $derived(imetas.length > 0);

	function formatFileSize(sizeStr?: string): string {
		if (!sizeStr) return '';
		const size = parseInt(sizeStr);
		if (isNaN(size)) return sizeStr;

		if (size < 1024) return `${size} B`;
		if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
		if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
		return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
	}

	function getMimeTypeLabel(mime?: string): string {
		if (!mime) return '';
		const parts = mime.split('/');
		return parts[parts.length - 1].toUpperCase();
	}
</script>

{#if hasImages}
	<div class="image-content {className}">
		{#each imetas as imeta, index}
			<div class="image-item">
				{#if imeta.url}
					<div class="image-wrapper">
						<img
							src={imeta.url}
							alt={imeta.alt || `Image ${index + 1}`}
							class="image {imageClass}"
							loading="lazy"
						/>
					</div>

					{#if showAlt && imeta.alt}
						<p class="image-alt">{imeta.alt}</p>
					{/if}

					{#if showMeta && (imeta.dim || imeta.m || imeta.size)}
						<div class="image-meta">
							{#if imeta.dim}
								<span class="meta-badge">
									<HugeiconsIcon icon={Image01Icon} size={14} />
									{imeta.dim}
								</span>
							{/if}
							{#if imeta.m}
								<span class="meta-badge">{getMimeTypeLabel(imeta.m)}</span>
							{/if}
							{#if imeta.size}
								<span class="meta-badge">{formatFileSize(imeta.size)}</span>
							{/if}
						</div>
					{/if}
				{/if}
			</div>
		{/each}
	</div>
{:else}
	<div class="image-content-empty {className}">
		<HugeiconsIcon icon={Image01Icon} size={48} />
		<p>No images available</p>
	</div>
{/if}

<style>
	/* CSS styles for image content component */

	.image-content {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.image-item {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.image-wrapper {
		position: relative;
		width: 100%;
		overflow: hidden;
		border-radius: 0.5rem;
		background-color: var(--muted);
	}

	.image {
		width: 100%;
		height: auto;
		display: block;
		object-fit: cover;
	}

	.image-alt {
		font-size: 0.875rem;
		color: var(--muted-foreground);
		font-style: italic;
		margin: 0;
		padding: 0 0.25rem;
	}

	.image-meta {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
		padding: 0 0.25rem;
	}

	.meta-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.25rem 0.5rem;
		font-size: 0.75rem;
		border-radius: 0.25rem;
		background-color: var(--muted);
		color: var(--muted-foreground);
		font-family: var(--font-mono);
	}

	.image-content-empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		padding: 3rem;
		border-radius: 0.5rem;
		background-color: var(--muted);
		color: var(--muted-foreground);
	}

	.image-content-empty p {
		margin: 0;
		font-size: 0.875rem;
	}
</style>
