<script lang="ts">
	import type { Snippet } from 'svelte';
	import { getContext } from 'svelte';
	import type { createMediaUpload } from './createMediaUpload.js';

	interface Props {
		multiple?: boolean;
		accept?: string;
		disabled?: boolean;
		children?: Snippet;
		class?: string;
	}

	let {
		multiple = true,
		accept = '*/*',
		disabled = false,
		children,
		class: className
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
</script>

<input
	bind:this={fileInput}
	type="file"
	{multiple}
	{accept}
	onchange={handleFileChange}
	class="hidden"
/>

<button
	type="button"
	onclick={openFilePicker}
	disabled={disabled || mediaUpload.isUploading}
	class={className}
>
	{#if children}
		{@render children()}
	{:else}
		{mediaUpload.isUploading ? 'Uploading...' : 'Upload Files'}
	{/if}
</button>
