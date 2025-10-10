<script lang="ts">
	import type { NodeViewProps } from '@tiptap/core';
	import type { NProfileAttributes } from 'nostr-editor';
	import NodeViewWrapper from '../NodeViewWrapper.svelte';
	import type { NDKSvelte } from '../../../ndk-svelte.svelte.js';

	let { node, ndk }: { node: NodeViewProps['node']; ndk?: NDKSvelte } = $props();

	let displayName = $state<string | undefined>(undefined);
	let loading = $state(true);

	$effect(() => {
		const attrs = node.attrs as NProfileAttributes;
		const pubkey = attrs.pubkey;
		if (!pubkey || !ndk) {
			loading = false;
			return;
		}

		loading = true;
		const user = ndk.getUser({ pubkey });
		user.fetchProfile()
			.then((profile) => {
				displayName = profile?.displayName || profile?.name || undefined;
				loading = false;
			})
			.catch((error) => {
				console.error('Profile fetch error', error);
				loading = false;
			});
	});

	const attrs = $derived(node.attrs as NProfileAttributes);
</script>

<NodeViewWrapper data-type="nprofile" as="span">
	{#snippet children()}
		{#if loading}
			<span class="loading">@loading...</span>
		{:else if displayName}
			<a href={`nostr:${attrs.bech32}`} class="mention-link">@{displayName}</a>
		{:else}
			<a href={`nostr:${attrs.bech32}`} class="mention-link">@{attrs.pubkey?.slice(0, 8)}</a>
		{/if}
	{/snippet}
</NodeViewWrapper>

<style>
	.mention-link {
		color: var(--mention-color, #0066cc);
		text-decoration: none;
	}

	.mention-link:hover {
		text-decoration: underline;
	}

	.loading {
		opacity: 0.6;
	}
</style>
