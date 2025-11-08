<script lang="ts">
	import { LinkPreview } from 'bits-ui';
	import { Link03Icon, Loading03Icon } from '@hugeicons/core-free-icons';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { cn } from '../../utils/cn.js';

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

<div class={cn("flex flex-col gap-2 my-2", className)}>
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
				<span class="text-sm">{linkUrl}</span>
			</LinkPreview.Trigger>

			<LinkPreview.Content class="bg-background border border-border rounded-lg shadow-lg overflow-hidden max-w-[360px] z-50">
				{#if loadingStates.get(linkUrl)}
					<div class="flex items-center gap-3 p-4 text-muted-foreground">
						<div class="animate-spin">
							<HugeiconsIcon icon={Loading03Icon} size={20} />
						</div>
						<span>Loading preview...</span>
					</div>
				{:else if hoveredUrl === linkUrl && previewData}
					<div class="flex flex-col">
						{#if previewData.image}
							<div class="w-full h-[180px] overflow-hidden bg-muted">
								<img src={previewData.image} alt={previewData.title || 'Link preview'} class="w-full h-full object-cover" />
							</div>
						{/if}
						<div class="p-4 flex flex-col gap-2">
							{#if previewData.title}
								<h4 class="text-base font-semibold text-foreground m-0 leading-normal line-clamp-2">{previewData.title}</h4>
							{/if}
							{#if previewData.description}
								<p class="text-sm text-muted-foreground m-0 leading-relaxed line-clamp-3">{previewData.description}</p>
							{/if}
							{#if previewData.domain}
								<div class="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
									<HugeiconsIcon icon={Link03Icon} size={12} />
									<span>{previewData.domain}</span>
								</div>
							{/if}
						</div>
					</div>
				{:else}
					<div class="flex flex-col">
						<div class="p-4 flex flex-col gap-2">
							<div class="flex items-center gap-1.5 text-xs text-muted-foreground">
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
