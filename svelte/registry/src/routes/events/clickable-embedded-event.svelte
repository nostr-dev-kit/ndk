<script lang="ts">
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import EmbeddedEvent from '$lib/registry/ui/embedded-event.svelte';
	import { ContentRenderer } from '$lib/registry/ui/content-renderer.svelte.js';

	interface Props {
		ndk: NDKSvelte;
		bech32: string;
		class?: string;
		isSelected: boolean;
		variant: string;
		onSelect: () => void;
		renderer: ContentRenderer;
	}

	let {
		ndk,
		bech32,
		class: className = '',
		isSelected,
		variant,
		onSelect,
		renderer
	}: Props = $props();
</script>

<div
	class="cursor-pointer border-2 {isSelected
		? 'border-orange-500'
		: 'border-orange-500/30'} border-dashed rounded p-2 my-2 transition-colors {className}"
	role="button"
	tabindex="0"
	onclick={onSelect}
	onkeydown={(e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			onSelect();
		}
	}}
>
	{#if variant === 'raw'}
		<div class="text-muted-foreground font-mono text-sm break-all p-2 bg-muted rounded">
			{bech32}
		</div>
	{:else}
		<EmbeddedEvent {ndk} {bech32} variant={variant as any} {renderer} />
	{/if}
</div>
