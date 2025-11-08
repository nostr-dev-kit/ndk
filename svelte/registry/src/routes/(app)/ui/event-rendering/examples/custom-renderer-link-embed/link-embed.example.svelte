<script lang="ts">
	import { Link03Icon, Loading03Icon, Image01Icon } from '@hugeicons/core-free-icons';
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
		favicon?: string;
	}

	let { url, class: className = '' }: Props = $props();

	// Normalize to array
	const urls = $derived(Array.isArray(url) ? url : [url]);

	// State for metadata
	const metadataMap = new Map<string, LinkMetadata | null>();
	const loadingMap = new Map<string, boolean>();
	const errorMap = new Map<string, boolean>();

	// Extract domain from URL
	const getDomain = (urlString: string): string => {
		try {
			const urlObj = new URL(urlString);
			return urlObj.hostname.replace('www.', '');
		} catch {
			return urlString;
		}
	};

	// Get favicon URL
	const getFaviconUrl = (urlString: string): string => {
		try {
			const urlObj = new URL(urlString);
			return `${urlObj.protocol}//${urlObj.hostname}/favicon.ico`;
		} catch {
			return '';
		}
	};

	// Fetch OpenGraph metadata
	const fetchMetadata = async (urlString: string) => {
		loadingMap.set(urlString, true);
		errorMap.set(urlString, false);

		try {
			// Try to fetch - will likely fail due to CORS
			const response = await fetch(urlString, { mode: 'cors' });
			const html = await response.text();

			const parser = new DOMParser();
			const doc = parser.parseFromString(html, 'text/html');

			const getMetaContent = (property: string): string | undefined => {
				let meta = doc.querySelector(`meta[property="${property}"]`);
				if (!meta) {
					meta = doc.querySelector(`meta[name="${property}"]`);
				}
				return meta?.getAttribute('content') || undefined;
			};

			const metadata: LinkMetadata = {
				title:
					getMetaContent('og:title') ||
					getMetaContent('twitter:title') ||
					doc.querySelector('title')?.textContent ||
					undefined,
				description:
					getMetaContent('og:description') ||
					getMetaContent('twitter:description') ||
					getMetaContent('description'),
				image: getMetaContent('og:image') || getMetaContent('twitter:image'),
				domain: getDomain(urlString),
				favicon: getFaviconUrl(urlString)
			};

			metadataMap.set(urlString, metadata);
		} catch (error) {
			// Fallback for CORS errors
			metadataMap.set(urlString, {
				domain: getDomain(urlString),
				favicon: getFaviconUrl(urlString)
			});
			errorMap.set(urlString, true);
		} finally {
			loadingMap.set(urlString, false);
		}
	};

	// Auto-fetch metadata for all URLs on mount
	$effect(() => {
		for (const linkUrl of urls) {
			if (!metadataMap.has(linkUrl) && !loadingMap.get(linkUrl)) {
				fetchMetadata(linkUrl);
			}
		}
	});
</script>

<div class="link-embed-container {className}">
	{#each urls as linkUrl, i (i)}
		{@const loading = loadingMap.get(linkUrl)}
		{@const metadata = metadataMap.get(linkUrl)}
		{@const error = errorMap.get(linkUrl)}

		<a href={linkUrl} target="_blank" rel="noopener noreferrer" class="link-embed-card">
			{#if loading}
				<div class="embed-loading">
					<div class="animate-spin">
						<HugeiconsIcon icon={Loading03Icon} size={20} />
					</div>
					<span class="loading-text">Loading preview...</span>
				</div>
			{:else if metadata}
				<div class="embed-content">
					{#if metadata.image}
						<div class="embed-image">
							<img src={metadata.image} alt={metadata.title || 'Link preview'} />
						</div>
					{:else}
						<div class="embed-image-placeholder">
							<HugeiconsIcon icon={Image01Icon} size={32} />
						</div>
					{/if}

					<div class="embed-body">
						<div class="embed-header">
							{#if metadata.favicon}
								<img src={metadata.favicon} alt="" class="embed-favicon" />
							{/if}
							<span class="embed-domain">{metadata.domain}</span>
							<div class="embed-external-icon">
								<HugeiconsIcon icon={Link03Icon} size={12} />
							</div>
						</div>

						{#if metadata.title}
							<h4 class="embed-title">{metadata.title}</h4>
						{/if}

						{#if metadata.description}
							<p class="embed-description">{metadata.description}</p>
						{/if}

						{#if error}
							<div class="embed-fallback-note">
								Limited preview available due to CORS restrictions
							</div>
						{/if}
					</div>
				</div>
			{:else}
				<div class="embed-content">
					<div class="embed-image-placeholder">
						<HugeiconsIcon icon={Image01Icon} size={32} />
					</div>
					<div class="embed-body">
						<div class="embed-header">
							<span class="embed-domain">{getDomain(linkUrl)}</span>
							<div class="embed-external-icon">
								<HugeiconsIcon icon={Link03Icon} size={12} />
							</div>
						</div>
						<p class="embed-url">{linkUrl}</p>
					</div>
				</div>
			{/if}
		</a>
	{/each}
</div>

<style>
	.link-embed-container {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin: 0.75rem 0;
	}

	.link-embed-card {
		display: block;
		border: 1px solid var(--border);
		border-radius: 0.75rem;
		overflow: hidden;
		text-decoration: none;
		transition: all 0.2s;
		background: var(--background);
	}

	.link-embed-card:hover {
		border-color: var(--primary);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		transform: translateY(-2px);
	}

	.embed-loading {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 1.5rem;
		color: var(--muted-foreground);
	}

	.loading-text {
		font-size: 0.875rem;
	}

	.embed-content {
		display: flex;
		gap: 1rem;
		min-height: 120px;
	}

	.embed-image {
		flex-shrink: 0;
		width: 200px;
		height: 100%;
		background: var(--muted);
		overflow: hidden;
	}

	.embed-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.embed-image-placeholder {
		flex-shrink: 0;
		width: 200px;
		height: 100%;
		background: var(--muted);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--muted-foreground);
	}

	.embed-body {
		flex: 1;
		padding: 1rem 1rem 1rem 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		min-width: 0;
	}

	.embed-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: var(--muted-foreground);
		font-size: 0.75rem;
	}

	.embed-favicon {
		width: 16px;
		height: 16px;
		object-fit: contain;
	}

	.embed-domain {
		font-weight: 500;
	}

	.embed-external-icon {
		margin-left: auto;
	}

	.embed-title {
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--foreground);
		margin: 0;
		line-height: 1.4;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.embed-description {
		font-size: 0.875rem;
		color: var(--muted-foreground);
		margin: 0;
		line-height: 1.5;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.embed-url {
		font-size: 0.875rem;
		color: var(--muted-foreground);
		font-family: monospace;
		word-break: break-all;
		margin: 0;
	}

	.embed-fallback-note {
		font-size: 0.75rem;
		color: var(--muted-foreground);
		font-style: italic;
		margin-top: 0.25rem;
	}


	/* Responsive */
	@media (max-width: 640px) {
		.embed-content {
			flex-direction: column;
		}

		.embed-image,
		.embed-image-placeholder {
			width: 100%;
			height: 180px;
		}

		.embed-body {
			padding: 1rem;
		}
	}
</style>
