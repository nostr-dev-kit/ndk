<script lang="ts">
	import type { NodeViewProps } from '@tiptap/core';
	import type { NAddrAttributes } from 'nostr-editor';
	import NodeViewWrapper from '../NodeViewWrapper.svelte';
	import type { NDKSvelte } from '../../../ndk-svelte.svelte.js';
	import { NDKKind } from '@nostr-dev-kit/ndk';

	let { node, ndk }: { node: NodeViewProps['node']; ndk?: NDKSvelte } = $props();

	let title = $state<string | undefined>(undefined);
	let loading = $state(true);

	$effect(() => {
		const attrs = node.attrs as NAddrAttributes;
		const { identifier, pubkey, kind } = attrs;
		if (!identifier || !pubkey || !kind || !ndk) {
			loading = false;
			return;
		}

		loading = true;
		ndk.fetchEvent({
			kinds: [kind as NDKKind],
			authors: [pubkey],
			'#d': [identifier]
		}, { closeOnEose: true })
			.then((event) => {
				if (event) {
					title = event.tagValue('title') || event.content?.slice(0, 50) || 'Article';
				}
				loading = false;
			})
			.catch(() => {
				loading = false;
			});
	});

	const attrs = $derived(node.attrs as NAddrAttributes);
</script>

<NodeViewWrapper data-type="naddr" as="span" class="naddr">
	{#snippet children()}
		{#if loading}
			<span class="loading">loading...</span>
		{:else if title}
			<a href={`nostr:${attrs.bech32}`} class="naddr-link">{title}</a>
		{:else}
			<a href={`nostr:${attrs.bech32}`} class="naddr-link">naddr:{attrs.identifier?.slice(0, 8)}</a>
		{/if}
	{/snippet}
</NodeViewWrapper>

<style>
	.naddr-link {
		color: var(--naddr-color, #d97706);
		text-decoration: none;
		font-weight: 500;
	}

	.naddr-link:hover {
		text-decoration: underline;
	}

	.loading {
		opacity: 0.6;
	}
</style>
