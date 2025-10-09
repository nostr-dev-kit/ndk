<script lang="ts">
	import type { NodeViewProps } from '@tiptap/core';
	import type { VideoAttributes } from 'nostr-editor';
	import NodeViewWrapper from '../NodeViewWrapper.svelte';

	let { node }: { node: NodeViewProps['node'] } = $props();

	const attrs = $derived(node.attrs as VideoAttributes);
</script>

<NodeViewWrapper data-type="video" class="video-wrapper">
	{#snippet children()}
		<video
			src={attrs.src}
			controls
			preload="metadata"
			class="editor-video"
		>
			<track kind="captions" />
		</video>
	{/snippet}
</NodeViewWrapper>

<style>
	.video-wrapper {
		display: block;
		margin: 1rem 0;
		max-width: 100%;
	}

	.video-wrapper.selected {
		outline: 2px solid var(--selection-color, #3b82f6);
		outline-offset: 2px;
	}

	.editor-video {
		max-width: 100%;
		height: auto;
		border-radius: 4px;
		display: block;
		background: #000;
	}

	.video-caption {
		font-size: 0.875rem;
		color: var(--caption-color, #6b7280);
		text-align: center;
		margin-top: 0.5rem;
	}
</style>
