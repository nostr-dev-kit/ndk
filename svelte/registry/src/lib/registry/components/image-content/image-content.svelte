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
	<div data-image-content="" class="flex flex-col gap-6 {className}">
		{#each imetas as imeta, index (imeta.url)}
			<div class="flex flex-col gap-3">
				{#if imeta.url}
					<div class="relative w-full overflow-hidden rounded-lg bg-muted">
						<img
							src={imeta.url}
							alt={imeta.alt || `Image ${index + 1}`}
							class="w-full h-auto block object-cover {imageClass}"
							loading="lazy"
						/>
					</div>

					{#if showAlt && imeta.alt}
						<p class="text-sm text-muted-foreground italic m-0 px-1">{imeta.alt}</p>
					{/if}

					{#if showMeta && (imeta.dim || imeta.m || imeta.size)}
						<div class="flex gap-2 flex-wrap px-1">
							{#if imeta.dim}
								<span class="inline-flex items-center gap-1 px-2 py-1 text-xs rounded bg-muted text-muted-foreground font-mono">
									<HugeiconsIcon icon={Image01Icon} size={14} />
									{imeta.dim}
								</span>
							{/if}
							{#if imeta.m}
								<span class="inline-flex items-center gap-1 px-2 py-1 text-xs rounded bg-muted text-muted-foreground font-mono">{getMimeTypeLabel(imeta.m)}</span>
							{/if}
							{#if imeta.size}
								<span class="inline-flex items-center gap-1 px-2 py-1 text-xs rounded bg-muted text-muted-foreground font-mono">{formatFileSize(imeta.size)}</span>
							{/if}
						</div>
					{/if}
				{/if}
			</div>
		{/each}
	</div>
{:else}
	<div data-image-content="" data-empty="" class="flex flex-col items-center justify-center gap-3 p-12 rounded-lg bg-muted text-muted-foreground {className}">
		<HugeiconsIcon icon={Image01Icon} size={48} />
		<p class="m-0 text-sm">No images available</p>
	</div>
{/if}
