<script lang="ts">
	import { LinkPreview } from 'bits-ui';
	import { Link03Icon, Loading03Icon } from '@hugeicons/core-free-icons';
	import { HugeiconsIcon } from '@hugeicons/svelte';

	interface Props {
		url: string | string[];
		class?: string;
	}

	interface LinkMetadata {
		title?: string;
		description?: string;
		image?: string;
		domain?: string;
	}

	let { url, class: className = '' }: Props = $props();

	const urls = $derived(Array.isArray(url) ? url : [url]);

	const metadataCache = new Map<string, LinkMetadata | null>();
	const loadingStates = new Map<string, boolean>();

	const getDomain = (urlString: string): string => {
		try {
			const urlObj = new URL(urlString);
			return urlObj.hostname.replace('www.', '');
		} catch {
			return urlString;
		}
	};

	const fetchMetadata = async (urlString: string): Promise<LinkMetadata | null> => {
		if (metadataCache.has(urlString)) {
			return metadataCache.get(urlString) || null;
		}

		loadingStates.set(urlString, true);

		try {
			const response = await fetch(urlString, { mode: 'cors' });
			const html = await response.text();

			const parser = new DOMParser();
			const doc = parser.parseFromString(html, 'text/html');

			const getMetaContent = (property: string): string | undefined => {
				const meta = doc.querySelector(`meta[property="${property}"]`);
				return meta?.getAttribute('content') || undefined;
			};

			const metadata: LinkMetadata = {
				title: getMetaContent('og:title') || doc.querySelector('title')?.textContent || undefined,
				description: getMetaContent('og:description') || getMetaContent('description'),
				image: getMetaContent('og:image'),
				domain: getDomain(urlString)
			};

			metadataCache.set(urlString, metadata);
			loadingStates.set(urlString, false);
			return metadata;
		} catch {
			const fallback: LinkMetadata = {
				domain: getDomain(urlString)
			};
			metadataCache.set(urlString, fallback);
			loadingStates.set(urlString, false);
			return fallback;
		}
	};

	let hoveredUrl = $state<string | null>(null);
	let previewData = $state<LinkMetadata | null>(null);

	const handleHover = async (urlString: string) => {
		hoveredUrl = urlString;
		previewData = await fetchMetadata(urlString);
	};
</script>

<div class="link-preview-container {className}">
	{#each urls as linkUrl, i (i)}
		<LinkPreview.Root openDelay={200} closeDelay={100}>
			<LinkPreview.Trigger
				class="inline-flex items-center gap-1.5 text-primary no-underline px-2 py-1 rounded-md transition-all hover:bg-muted hover:underline break-all"
				href={linkUrl}
				target="_blank"
				rel="noopener noreferrer"
				onmouseenter={() => handleHover(linkUrl)}
			>
				<HugeiconsIcon icon={Link03Icon} size={14} />
				<span class="link-text">{linkUrl}</span>
			</LinkPreview.Trigger>

			<LinkPreview.Content class="bg-background border border-border rounded-lg shadow-lg overflow-hidden max-w-[360px] z-50">
				{#if loadingStates.get(linkUrl)}
					<div class="preview-loading">
						<div class="animate-spin">
							<HugeiconsIcon icon={Loading03Icon} size={20} />
						</div>
						<span>Loading preview...</span>
					</div>
				{:else if hoveredUrl === linkUrl && previewData}
					<div class="preview-card">
						{#if previewData.image}
							<div class="preview-image">
								<img src={previewData.image} alt={previewData.title || 'Link preview'} />
							</div>
						{/if}
						<div class="preview-body">
							{#if previewData.title}
								<h4 class="preview-title">{previewData.title}</h4>
							{/if}
							{#if previewData.description}
								<p class="preview-description">{previewData.description}</p>
							{/if}
							{#if previewData.domain}
								<div class="preview-domain">
									<HugeiconsIcon icon={Link03Icon} size={12} />
									<span>{previewData.domain}</span>
								</div>
							{/if}
						</div>
					</div>
				{:else}
					<div class="preview-card">
						<div class="preview-body">
							<div class="preview-domain">
								<HugeiconsIcon icon={Link03Icon} size={12} />
								<span>{getDomain(linkUrl)}</span>
							</div>
						</div>
					</div>
				{/if}
			</LinkPreview.Content>
		</LinkPreview.Root>
	{/each}
</div>

<style>
	.link-preview-container {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin: 0.5rem 0;
	}

	.link-text {
		font-size: 0.875rem;
	}

	.preview-loading {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 1rem;
		color: var(--muted-foreground);
	}

	.preview-card {
		display: flex;
		flex-direction: column;
	}

	.preview-image {
		width: 100%;
		height: 180px;
		overflow: hidden;
		background: var(--muted);
	}

	.preview-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.preview-body {
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.preview-title {
		font-size: 1rem;
		font-weight: 600;
		color: var(--foreground);
		margin: 0;
		line-height: 1.4;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.preview-description {
		font-size: 0.875rem;
		color: var(--muted-foreground);
		margin: 0;
		line-height: 1.5;
		display: -webkit-box;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.preview-domain {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		font-size: 0.75rem;
		color: var(--muted-foreground);
		margin-top: 0.25rem;
	}
</style>
