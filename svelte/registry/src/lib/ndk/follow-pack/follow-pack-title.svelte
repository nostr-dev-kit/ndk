<script lang="ts">
	import { getContext } from 'svelte';
	import { FOLLOW_PACK_CONTEXT_KEY } from './follow-pack.context.js';
	import type { FollowPackContext } from './follow-pack.context.js';

	interface Props {
		class?: string;
		lines?: number;
	}

	let { class: className = '', lines }: Props = $props();

	const context = getContext<FollowPackContext>(FOLLOW_PACK_CONTEXT_KEY);
	const title = $derived(context.followPack.title || 'Untitled Pack');

	const lineClampClass = $derived(lines ? `line-clamp-${lines}` : '');
</script>

<span class="follow-pack-title {lineClampClass} {className}">
	{title}
</span>
