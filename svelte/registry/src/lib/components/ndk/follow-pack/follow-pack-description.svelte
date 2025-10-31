<script lang="ts">
	import { getContext } from 'svelte';
	import { FOLLOW_PACK_CONTEXT_KEY } from './follow-pack.context.js';
	import type { FollowPackContext } from './follow-pack.context.js';

	interface Props {
		class?: string;
		maxLength?: number;
		lines?: number;
	}

	let { class: className = '', maxLength, lines }: Props = $props();

	const context = getContext<FollowPackContext>(FOLLOW_PACK_CONTEXT_KEY);
	const description = $derived(context.followPack.description || '');

	const truncatedDescription = $derived(
		maxLength && description.length > maxLength
			? description.slice(0, maxLength) + '...'
			: description
	);

	const lineClampClass = $derived(lines ? `line-clamp-${lines}` : '');
</script>

{#if description}
	<span class="follow-pack-description {lineClampClass} {className}">
		{truncatedDescription}
	</span>
{/if}
