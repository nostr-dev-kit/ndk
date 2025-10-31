<script lang="ts">
	import type { MediaUploadResult } from './createMediaUpload.js';

	interface Props {
		upload: MediaUploadResult;
		showProgress?: boolean;
		showError?: boolean;
		class?: string;
	}

	let {
		upload,
		showProgress = true,
		showError = true,
		class: className
	}: Props = $props();

	const isImage = $derived(upload.mimeType.startsWith('image/'));
	const isVideo = $derived(upload.mimeType.startsWith('video/'));
	const isAudio = $derived(upload.mimeType.startsWith('audio/'));
</script>

<div class={className}>
	{#if isImage}
		<img src={upload.url} alt="" class="w-full h-full object-cover" />
	{:else if isVideo}
		<video src={upload.url} class="w-full h-full object-cover" controls>
			<track kind="captions" />
		</video>
	{:else if isAudio}
		<audio src={upload.url} class="w-full" controls></audio>
	{:else}
		<div class="flex items-center justify-center w-full h-full bg-muted">
			<span class="text-sm text-muted-foreground">{upload.mimeType}</span>
		</div>
	{/if}
</div>
