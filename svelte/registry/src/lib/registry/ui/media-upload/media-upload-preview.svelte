<script lang="ts">
	import { mergeProps } from '../../utils/merge-props.js';
	import type { Snippet } from 'svelte';
	import type { MediaUploadResult } from './createMediaUpload.svelte';

	interface Props {
		upload: MediaUploadResult;

		child?: Snippet<[{
			props: Record<string, any>;
			isImage: boolean;
			isVideo: boolean;
			isAudio: boolean;
			upload: MediaUploadResult;
		}]>;

		children?: Snippet<[{
			isImage: boolean;
			isVideo: boolean;
			isAudio: boolean;
			upload: MediaUploadResult;
		}]>;

		class?: string;

		showProgress?: boolean;

		showError?: boolean;

		[key: string]: any;
	}

	let {
		upload,
		child,
		children,
		class: className = '',
		showProgress = true,
		showError = true,
		...restProps
	}: Props = $props();

	const isImage = $derived(upload.mimeType.startsWith('image/'));
	const isVideo = $derived(upload.mimeType.startsWith('video/'));
	const isAudio = $derived(upload.mimeType.startsWith('audio/'));

	const snippetProps = $derived({
		isImage,
		isVideo,
		isAudio,
		upload
	});

	const mergedProps = $derived(mergeProps(restProps, { class: className }));
</script>

{#if child}
	{@render child({ props: mergedProps, ...snippetProps })}
{:else if children}
	<div {...mergedProps}>
		{@render children(snippetProps)}
	</div>
{:else}
	<!-- Default implementation -->
	<div {...mergedProps}>
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
{/if}
