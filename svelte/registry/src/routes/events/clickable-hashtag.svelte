<script lang="ts">
	import Hashtag from '$lib/registry/components/hashtag/hashtag.svelte';
	import { getContext } from 'svelte';

	interface Props {
		tag: string;
		class?: string;
	}

	let { tag, class: className = '' }: Props = $props();

	// Get interactive state from context
	const interactiveState = getContext<{
		selectedEmbed: string | null;
		variants: Record<string, string>;
		selectEmbed: (type: string) => void;
	}>('interactive-demo');

	const isSelected = $derived(interactiveState && interactiveState.selectedEmbed === 'hashtag');
	const variant = $derived(interactiveState ? interactiveState.variants.hashtag : 'inline');

	function handleSelect() {
		if (interactiveState) {
			interactiveState.selectEmbed('hashtag');
		}
	}
</script>

<span
	class="inline-block cursor-pointer border-2 {isSelected
		? 'border-purple-500'
		: 'border-purple-500/30'} border-dashed rounded px-1 transition-colors {className}"
	role="button"
	tabindex="0"
	onclick={handleSelect}
	onkeydown={(e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			handleSelect();
		}
	}}
>
	{#if variant === 'raw'}
		<span class="text-muted-foreground">#{tag}</span>
	{:else}
		<Hashtag {tag} />
	{/if}
</span>
