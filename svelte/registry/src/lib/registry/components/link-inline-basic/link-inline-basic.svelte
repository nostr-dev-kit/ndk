<script lang="ts">
	import { getContext } from 'svelte';
	import { LinkIcon } from '../../ui/icons';
	import { cn } from '../../utils/cn.js';
	import { ENTITY_CLICK_CONTEXT_KEY, type EntityClickContext } from '../../ui/entity-click-context.js';

	interface Props {
		url: string | string[];
		class?: string;
	}

	let { url, class: className = '' }: Props = $props();

	const entityClickContext = getContext<EntityClickContext | undefined>(ENTITY_CLICK_CONTEXT_KEY);
	const urls = $derived(Array.isArray(url) ? url : [url]);

	function handleLinkClick(e: MouseEvent, linkUrl: string) {
		if (entityClickContext?.onLinkClick) {
			e.preventDefault();
			e.stopPropagation();
			entityClickContext.onLinkClick(linkUrl);
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
