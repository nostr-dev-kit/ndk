<script lang="ts">
	import { getContext } from 'svelte';
	import { FOLLOW_PACK_CONTEXT_KEY } from './follow-pack.context.js';
	import type { FollowPackContext } from './follow-pack.context.js';

	interface Props {
		class?: string;
		format?: 'short' | 'long';
	}

	let { class: className = '', format = 'short' }: Props = $props();

	const context = getContext<FollowPackContext>(FOLLOW_PACK_CONTEXT_KEY);
	const count = $derived(context.followPack.pubkeys?.length ?? 0);

	const displayText = $derived(
		format === 'long' ? `${count} ${count === 1 ? 'person' : 'people'}` : count.toString()
	);
</script>

<span class="follow-pack-member-count {className}">
	{displayText}
</span>
