<script lang="ts">
	import type { NodeViewProps } from '@tiptap/core';
	import type { ImageAttributes } from 'nostr-editor';
	import NodeViewWrapper from '../NodeViewWrapper.svelte';

	let { node }: { node: NodeViewProps['node'] } = $props();

	const attrs = $derived(node.attrs as ImageAttributes);
</script>

<NodeViewWrapper data-type="image" class="image-wrapper">
	{#snippet children()}
		<img
			src={attrs.src}
			alt={attrs.alt || ''}
			title={attrs.title || ''}
			loading="lazy"
			class="editor-image"
		/>
		{#if attrs.alt}
			<div class="image-caption">{attrs.alt}</div>
		{/if}
	{/snippet}
</NodeViewWrapper>

<style>
	.image-wrapper {
		display: block;
		margin: 1rem 0;
		max-width: 100%;
	}

	.image-wrapper.selected {
		outline: 2px solid var(--selection-color, #3b82f6);
		outline-offset: 2px;
	}

	.editor-image {
		max-width: 100%;
		height: auto;
		border-radius: 4px;
		display: block;
	}

	.image-caption {
		font-size: 0.875rem;
		color: var(--caption-color, #6b7280);
		text-align: center;
		margin-top: 0.5rem;
	}
</style>
