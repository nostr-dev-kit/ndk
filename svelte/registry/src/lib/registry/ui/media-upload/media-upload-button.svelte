<script lang="ts">
	import type { Snippet } from 'svelte';
	import { getContext } from 'svelte';
	import type { createMediaUpload } from './createMediaUpload.svelte';
	import { mergeProps } from '../../utils/merge-props/index.js';

	interface UploadSnippetProps {
		isUploading: boolean;
		uploadCount: number;
	}

	interface Props {
		multiple?: boolean;
		accept?: string;
		disabled?: boolean;
		class?: string;
		child?: Snippet<[{ props: any } & UploadSnippetProps]>;
		children?: Snippet<[UploadSnippetProps]>;
	}

	let {
		multiple = true,
		accept = '*/*',
		disabled = false,
		class: className = '',
		child,
		children,
		...restProps
	}: Props = $props();

	const mediaUpload = getContext<ReturnType<typeof createMediaUpload>>('mediaUpload');

	let fileInput: HTMLInputElement;

	async function handleFileChange(event: Event) {
		const target = event.target as HTMLInputElement;
		if (!target.files || target.files.length === 0) return;

		await mediaUpload.uploadFiles(target.files);

		// Reset input so same file can be selected again
		target.value = '';
	}

	function openFilePicker() {
		fileInput?.click();
	}

	const mergedProps = $derived(mergeProps(restProps, {
		type: 'button' as const,
		onclick: openFilePicker,
		disabled: disabled || mediaUpload.isUploading,
		'aria-label': mediaUpload.isUploading ? 'Uploading files' : 'Upload files',
		'data-uploading': mediaUpload.isUploading,
		class: className
	}));

	const snippetProps = $derived({
		isUploading: mediaUpload.isUploading,
		uploadCount: mediaUpload.uploads?.length || 0
	});
</script>

<input
	bind:this={fileInput}
	type="file"
	{multiple}
	{accept}
	onchange={handleFileChange}
	style="display: none;"
	aria-hidden="true"
/>

{#if child}
	{@render child({ props: mergedProps, ...snippetProps })}
{:else}
	<button {...mergedProps}>
		{#if children}
			{@render children(snippetProps)}
		{:else}
			{mediaUpload.isUploading ? 'Uploading...' : 'Upload Files'}
		{/if}
	</button>
{/if}
