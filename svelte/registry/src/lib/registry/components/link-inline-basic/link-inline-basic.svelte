<script lang="ts">
	import { LinkIcon } from '../../ui/icons';
	import { cn } from '../../utils/cn.js';

	interface Props {
		url: string | string[];
		onclick?: (url: string) => void;
		class?: string;
	}

	let { url, onclick, class: className = '' }: Props = $props();

	const urls = $derived(Array.isArray(url) ? url : [url]);

	function handleLinkClick(e: MouseEvent, linkUrl: string) {
		if (onclick) {
			e.preventDefault();
			e.stopPropagation();
			onclick(linkUrl);
		}
	}
</script>

<div class={cn('flex flex-col gap-2 my-2', className)}>
	{#each urls as linkUrl (linkUrl)}
		<a
			href={linkUrl}
			target="_blank"
			rel="noopener noreferrer"
			onclick={(e) => handleLinkClick(e, linkUrl)}
			class="inline-flex items-center gap-1.5 text-primary no-underline px-2 py-1 rounded-md transition-all hover:bg-muted hover:underline break-all"
		>
			<LinkIcon class="flex-shrink-0" size={14} />
			<span class="text-sm">{linkUrl}</span>
		</a>
	{/each}
</div>
