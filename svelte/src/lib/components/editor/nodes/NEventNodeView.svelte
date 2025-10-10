<script lang="ts">
	import type { NodeViewProps } from '@tiptap/core';
	import type { NEventAttributes } from 'nostr-editor';
	import NodeViewWrapper from '../NodeViewWrapper.svelte';
	import type { NDKSvelte } from '../../../ndk-svelte.svelte.js';

	let { node, ndk }: { node: NodeViewProps['node']; ndk?: NDKSvelte } = $props();

	let content = $state<string | undefined>(undefined);
	let loading = $state(true);

	$effect(() => {
		const attrs = node.attrs as NEventAttributes;
		const id = attrs.id;
		if (!id || !ndk) {
			loading = false;
			return;
		}

		loading = true;
		ndk.fetchEvent(id, { closeOnEose: true })
			.then((event) => {
				if (event) {
					content = event.content?.slice(0, 100) || 'Event';
				}
				loading = false;
			})
			.catch(() => {
				loading = false;
			});
	});

	const attrs = $derived(node.attrs as NEventAttributes);
</script>

<NodeViewWrapper data-type="nevent" as="span" class="nevent">
	{#snippet children()}
		{#if loading}
			<span class="loading">loading event...</span>
		{:else if content}
			<a href={`nostr:${attrs.bech32}`} class="nevent-link">{content}{content.length >= 100 ? '...' : ''}</a>
		{:else}
			<a href={`nostr:${attrs.bech32}`} class="nevent-link">event:{attrs.id?.slice(0, 8)}</a>
		{/if}
	{/snippet}
</NodeViewWrapper>

<style>
	.nevent-link {
		color: var(--nevent-color, #6b46c1);
		text-decoration: none;
		font-style: italic;
	}

	.nevent-link:hover {
		text-decoration: underline;
	}

	.loading {
		opacity: 0.6;
	}
</style>
