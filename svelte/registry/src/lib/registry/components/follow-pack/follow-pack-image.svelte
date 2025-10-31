<script lang="ts">
	import { getContext } from 'svelte';
	import { FOLLOW_PACK_CONTEXT_KEY } from './follow-pack.context.js';
	import type { FollowPackContext } from './follow-pack.context.js';

	interface Props {
		class?: string;
		showGradient?: boolean;
		fallback?: string;
	}

	let { class: className = '', showGradient = false, fallback }: Props = $props();

	const context = getContext<FollowPackContext>(FOLLOW_PACK_CONTEXT_KEY);
	const imageUrl = $derived(context.followPack.image || fallback);
</script>

{#if imageUrl}
	<div class="follow-pack-image relative overflow-hidden {className}">
		<img src={imageUrl} alt={context.followPack.title || 'Follow pack'} class="w-full h-full object-cover" />
		{#if showGradient}
			<div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
		{/if}
	</div>
{:else if fallback === undefined}
	<div class="follow-pack-image-fallback bg-muted flex items-center justify-center {className}">
		<svg class="w-1/3 h-1/3 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
		</svg>
	</div>
{/if}

