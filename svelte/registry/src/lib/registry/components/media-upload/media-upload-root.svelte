<script lang="ts">
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import type { Snippet } from 'svelte';
	import { setContext, getContext } from 'svelte';
	import { createMediaUpload, type MediaUploadOptions, type MediaUploadResult } from './createMediaUpload.svelte';

	interface Props {
		ndk?: NDKSvelte;
		fallbackServer?: string;
		accept?: string;
		maxFiles?: number;
		uploads?: MediaUploadResult[];
		children: Snippet;
		class?: string;
	}

	let {
		ndk = getContext('ndk'),
		fallbackServer = 'https://blossom.primal.net',
		accept,
		maxFiles,
		uploads = $bindable([]),
		children,
		class: className
	}: Props = $props();

	const options: MediaUploadOptions = {
		fallbackServer,
		accept,
		maxFiles
	};

	const mediaUpload = createMediaUpload(ndk!, options);

	// Sync bindable prop with internal state
	$effect(() => {
		uploads = mediaUpload.uploads;
	});

	$effect(() => {
		mediaUpload.uploads = uploads;
	});

	setContext('mediaUpload', mediaUpload);
</script>

<div class={className}>
	{@render children()}
</div>
