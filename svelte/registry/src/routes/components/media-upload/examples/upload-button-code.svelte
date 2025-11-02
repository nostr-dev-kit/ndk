<script lang="ts">
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import type { MediaUploadResult } from '$lib/registry/ui/media-upload';
	import { MediaUpload } from '$lib/registry/ui/media-upload';

	interface Props {
		ndk: NDKSvelte;
		uploads: MediaUploadResult[];
	}

	let { ndk, uploads = $bindable([]) }: Props = $props();
</script>

<MediaUpload.Root {ndk} fallbackServer="https://blossom.primal.net" bind:uploads>
	<MediaUpload.Button
		multiple
		accept="*/*"
		class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
	>
		Upload Files
	</MediaUpload.Button>
</MediaUpload.Root>
