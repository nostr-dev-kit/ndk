<script lang="ts">
	import { getContext } from 'svelte';
	import { LinkIcon } from '../../ui/icons';
	import { cn } from '../../utils/cn.js';
	import { ENTITY_CLICK_CONTEXT_KEY, type EntityClickContext } from '../../ui/entity-click-context.js';

	interface Props {
		url: string | string[];
		class?: string;
	}

	const entityClickContext = getContext<EntityClickContext | undefined>(ENTITY_CLICK_CONTEXT_KEY);

	interface LinkMetadata {
		title?: string;
		description?: string;
		image?: string;
		domain?: string;
		favicon?: string;
	}

	let { url, class: className = '' }: Props = $props();

	const urls = $derived(Array.isArray(url) ? url : [url]);

	const metadataMap = new Map<string, LinkMetadata | null>();
	const loadingMap = new Map<string, boolean>();

	const getDomain = (urlString: string): string => {
		try {
			const urlObj = new URL(urlString);
			return urlObj.hostname.replace('www.', '');
		} catch {
			return urlString;
		}
	};

	const getFaviconUrl = (urlString: string): string => {
		try {
			const urlObj = new URL(urlString);
			return `${urlObj.protocol}//${urlObj.hostname}/favicon.ico`;
		} catch {
			return '';
		}
	};

	const fetchMetadata = async (urlString: string) => {
		loadingMap.set(urlString, true);

		try {
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
		} catch {
			metadataMap.set(urlString, {
				domain: getDomain(urlString),
				favicon: getFaviconUrl(urlString)
			});
		} finally {
			loadingMap.set(urlString, false);
		}
	};

	$effect(() => {
		for (const linkUrl of urls) {
			if (!metadataMap.has(linkUrl) && !loadingMap.get(linkUrl)) {
				fetchMetadata(linkUrl);
			}
		}
	});

	function handleLinkClick(e: MouseEvent, linkUrl: string) {
		if (entityClickContext?.onLinkClick) {
			e.preventDefault();
			e.stopPropagation();
			entityClickContext.onLinkClick(linkUrl);
		}
	}
</script>

<div class={cn('flex flex-col gap-3 my-3', className)}>
	{#each urls as linkUrl, i (i)}
		{@const loading = loadingMap.get(linkUrl)}
		{@const metadata = metadataMap.get(linkUrl)}

		<a
			href={linkUrl}
			target="_blank"
			rel="noopener noreferrer"
			onclick={(e) => handleLinkClick(e, linkUrl)}
			class="block border border-border rounded-xl overflow-hidden no-underline transition-all bg-background hover:border-primary hover:shadow-lg hover:-translate-y-0.5"
		>
			{#if loading}
				<div class="flex items-center gap-3 p-6 text-muted-foreground">
					<div class="animate-spin">
						<svg
							class="w-5 h-5"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
						>
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
							<path
								class="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							/>
						</svg>
					</div>
					<span class="text-sm">Loading preview...</span>
				</div>
			{:else if metadata}
				<div class="flex min-h-[120px] sm:flex-row flex-col">
					{#if metadata.image}
						<div class="flex-shrink-0 w-full sm:w-[200px] h-[180px] sm:h-auto bg-muted overflow-hidden">
							<img
								src={metadata.image}
								alt={metadata.title || 'Link preview'}
								class="w-full h-full object-cover"
							/>
						</div>
					{:else}
						<div class="flex-shrink-0 w-full sm:w-[200px] h-[180px] sm:h-auto bg-muted flex items-center justify-center text-muted-foreground">
							<svg
								class="w-8 h-8"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								stroke-width="2"
							>
								<rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
								<circle cx="8.5" cy="8.5" r="1.5" />
								<polyline points="21 15 16 10 5 21" />
							</svg>
						</div>
					{/if}

					<div class="flex-1 flex flex-col gap-2 p-4 min-w-0">
						<div class="flex items-center gap-2 text-muted-foreground text-xs">
							{#if metadata.favicon}
								<img src={metadata.favicon} alt="" class="w-4 h-4 object-contain" />
							{/if}
							<span class="font-medium">{metadata.domain}</span>
							<div class="ml-auto">
								<LinkIcon size={12} />
							</div>
						</div>

						{#if metadata.title}
							<h4 class="text-lg font-semibold text-foreground m-0 leading-snug line-clamp-2">
								{metadata.title}
							</h4>
						{/if}

						{#if metadata.description}
							<p class="text-sm text-muted-foreground m-0 leading-relaxed line-clamp-2">
								{metadata.description}
							</p>
						{/if}
					</div>
				</div>
			{:else}
				<div class="flex min-h-[120px] sm:flex-row flex-col">
					<div class="flex-shrink-0 w-full sm:w-[200px] h-[180px] sm:h-auto bg-muted flex items-center justify-center text-muted-foreground">
						<svg
							class="w-8 h-8"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							stroke-width="2"
						>
							<rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
							<circle cx="8.5" cy="8.5" r="1.5" />
							<polyline points="21 15 16 10 5 21" />
						</svg>
					</div>
					<div class="flex-1 flex flex-col gap-2 p-4 min-w-0">
						<div class="flex items-center gap-2 text-muted-foreground text-xs">
							<span class="font-medium">{getDomain(linkUrl)}</span>
							<div class="ml-auto">
								<LinkIcon size={12} />
							</div>
						</div>
						<p class="text-sm text-muted-foreground font-mono break-all m-0">{linkUrl}</p>
					</div>
				</div>
			{/if}
		</a>
	{/each}
</div>
