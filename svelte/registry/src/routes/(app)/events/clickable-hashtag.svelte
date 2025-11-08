<script lang="ts">
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import Hashtag from '$lib/registry/components/hashtag/hashtag.svelte';
	import HashtagModern from '$lib/registry/components/hashtag/displays/modern/hashtag-modern.svelte';
	import { getContext } from 'svelte';

	interface Props {
		tag: string;
		ndk?: NDKSvelte;
		class?: string;
	}

	let { ndk, tag, class: className = '' }: Props = $props();

	// Get interactive state from context
	const interactiveState = getContext<{
		selectedEmbed: string | null;
		variants: Record<string, string>;
		selectEmbed: (type: string) => void;
	}>('interactive-demo');

	const isSelected = $derived(interactiveState && interactiveState.selectedEmbed === 'hashtag');
	const variant = $derived(interactiveState ? interactiveState.variants.hashtag : 'hashtag');

	function handleSelect(e: MouseEvent | KeyboardEvent) {
		e.stopPropagation();
		if (interactiveState) {
			interactiveState.selectEmbed('hashtag');
		}
	}
</script>

<span
	class="inline-block cursor-pointer border-2 {isSelected
		? 'border-orange-500'
		: 'border-orange-500/30'} border-dashed rounded px-1 transition-colors {className}"
	role="button"
	tabindex="0"
	onclick={handleSelect}
	onkeydown={(e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			handleSelect(e);
		}
	}}
>
	{#if variant === 'raw'}
		<span class="text-muted-foreground">#{tag}</span>
	{:else if variant === 'hashtag-modern'}
		<HashtagModern {ndk} {tag} />
	{:else}
		<Hashtag {tag} />
	{/if}
</span>
