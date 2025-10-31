<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { MediaUploadResult } from './createMediaUpload.svelte';

	interface Props {
		upload: MediaUploadResult;
		index: number;
		onRemove?: (index: number) => void;
		onReorder?: (fromIndex: number, toIndex: number) => void;
		children: Snippet;
		class?: string;
	}

	let {
		upload,
		index,
		onRemove,
		onReorder,
		children,
		class: className = 'relative'
	}: Props = $props();

	let isDragging = $state(false);

	function handleDragStart(event: DragEvent) {
		if (!onReorder) return;
		isDragging = true;
		event.dataTransfer!.effectAllowed = 'move';
		event.dataTransfer!.setData('text/plain', index.toString());
	}

	function handleDragEnd() {
		isDragging = false;
	}

	function handleDragOver(event: DragEvent) {
		if (!onReorder) return;
		event.preventDefault();
		event.dataTransfer!.dropEffect = 'move';
	}

	function handleDrop(event: DragEvent) {
		if (!onReorder) return;
		event.preventDefault();

		const fromIndex = parseInt(event.dataTransfer!.getData('text/plain'));
		const toIndex = index;

		if (fromIndex !== toIndex) {
			onReorder(fromIndex, toIndex);
		}
	}

	function handleRemove() {
		onRemove?.(index);
	}
</script>

<div
	class={className}
	draggable={!!onReorder}
	ondragstart={handleDragStart}
	ondragend={handleDragEnd}
	ondragover={handleDragOver}
	ondrop={handleDrop}
	class:opacity-50={isDragging}
	role="button"
	tabindex={onReorder ? 0 : -1}
>
	{@render children()}

	{#if onRemove}
		<button
			type="button"
			onclick={handleRemove}
			class="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
			aria-label="Remove"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<path d="M18 6 6 18" />
				<path d="m6 6 12 12" />
			</svg>
		</button>
	{/if}
</div>
