<!--
  IMPORTANT: Keep this file in sync with index.txt

  Rules for maintaining sync between index.svelte and index.txt:
  1. Both files must demonstrate the SAME functionality
  2. index.svelte = Full implementation (with TypeScript interfaces, all imports, complete styling)
  3. index.txt = Simplified documentation version with these changes:
     - Remove TypeScript interface definitions
     - Use inline prop destructuring: let { url, class: className = '' } = $props();
     - Keep only essential imports (remove type imports unless needed)
     - Keep inline classes (class="...") but remove <style> blocks
     - Focus on showing component API usage, not implementation details
     - Keep the core component usage identical between both files

  When you modify this file, you MUST update index.txt to reflect the same changes
  following the simplification rules above.
-->

<script lang="ts">
	import { LinkIcon } from '$lib/registry/ui/icons';

	interface Props {
		url: string | string[];
		class?: string;
	}

	let { url, class: className = '' }: Props = $props();
	const urls = Array.isArray(url) ? url : [url];
</script>

<div class="flex flex-col gap-2 {className}">
	{#each urls as linkUrl (linkUrl)}
		<a
			href={linkUrl}
			target="_blank"
			rel="noopener noreferrer"
			class="inline-flex items-center gap-1.5 text-orange-500 no-underline px-2 py-1 rounded-md transition-all hover:bg-orange-500/10 hover:underline break-all"
		>
			<LinkIcon size={14} class="flex-shrink-0" />
			<span class="text-sm">{linkUrl}</span>
		</a>
	{/each}
</div>
