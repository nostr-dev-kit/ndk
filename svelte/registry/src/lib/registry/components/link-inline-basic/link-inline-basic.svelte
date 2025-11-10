<script lang="ts">
	import { LinkIcon } from '../../ui/icons';
	import { cn } from '../../utils/cn.js';

	interface Props {
		url: string | string[];
		class?: string;
	}

	let { url, class: className = '' }: Props = $props();

	const urls = $derived(Array.isArray(url) ? url : [url]);
</script>

<div class={cn('flex flex-col gap-2 my-2', className)}>
	{#each urls as linkUrl (linkUrl)}
		<a
			href={linkUrl}
			target="_blank"
			rel="noopener noreferrer"
			class="inline-flex items-center gap-1.5 text-primary no-underline px-2 py-1 rounded-md transition-all hover:bg-muted hover:underline break-all"
		>
			<LinkIcon class="flex-shrink-0" size={14} />
			<span class="text-sm">{linkUrl}</span>
		</a>
	{/each}
</div>
