<script lang="ts">
	import { getContext } from 'svelte';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import Mention from '$lib/registry/components/mention/mention.svelte';
	import MentionModern from '$lib/registry/components/mention-modern/mention-modern.svelte';

	interface Props {
		ndk: NDKSvelte;
		bech32: string;
		class?: string;
	}

	let { ndk, bech32, class: className = '' }: Props = $props();

	// Get interactive state from context
	const interactiveState = getContext<{
		selectedEmbed: string | null;
		variants: Record<string, string>;
		selectEmbed: (type: string) => void;
	}>('interactive-demo');

	const isSelected = $derived(interactiveState && interactiveState.selectedEmbed === 'mention');
	const variant = $derived(interactiveState ? interactiveState.variants.mention : 'mention');

	function handleSelect(e: MouseEvent | KeyboardEvent) {
		e.stopPropagation();
		if (interactiveState) {
			interactiveState.selectEmbed('mention');
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
		<span class="text-muted-foreground font-mono text-sm">{bech32}</span>
	{:else if variant === 'mention-modern'}
		<MentionModern {ndk} {bech32} />
	{:else}
		<Mention {ndk} {bech32} />
	{/if}
</span>
