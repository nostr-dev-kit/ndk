<script lang="ts">
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import type { MediaUploadResult } from '../../../ui/media-upload/createMediaUpload.svelte';
	import { MediaUpload } from '../../../ui/media-upload/index.js';
	import { getContext } from 'svelte';

	interface Props {
		ndk?: NDKSvelte;
		uploads?: MediaUploadResult[];
		fallbackServer?: string;
		accept?: string;
		buttonText?: string;
		multiple?: boolean;
		maxFiles?: number;
		class?: string;
	}

	let {
		ndk = getContext('ndk'),
		uploads = $bindable([]),
		fallbackServer = 'https://blossom.primal.net',
		accept = '*/*',
		buttonText = 'Upload Files',
		multiple = true,
		maxFiles,
		class: className = 'inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
	}: Props = $props();
</script>

<MediaUpload.Root {ndk} {fallbackServer} {accept} {maxFiles} bind:uploads>
	<MediaUpload.Button data-upload-button="" data-multiple={multiple ? '' : undefined} {multiple} {accept} class={className}>
		{buttonText}
	</MediaUpload.Button>
</MediaUpload.Root>
