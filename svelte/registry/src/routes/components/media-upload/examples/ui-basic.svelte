<script lang="ts">
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import type { MediaUploadResult } from '$lib/components/ndk/media-upload';
	import { MediaUpload } from '$lib/components/ndk/media-upload';

	interface Props {
		ndk: NDKSvelte;
	}

	let { ndk }: Props = $props();

	let uploads = $state<MediaUploadResult[]>([]);
</script>

<MediaUpload.Root {ndk} bind:uploads>
	<div class="space-y-4">
		<MediaUpload.Button class="px-4 py-2 rounded-md bg-primary text-primary-foreground">
			Select Files
		</MediaUpload.Button>

		{#if uploads.length > 0}
			<div class="grid grid-cols-3 gap-2">
				{#each uploads as upload (upload.url)}
					<MediaUpload.Preview {upload} class="w-full h-24 rounded-md overflow-hidden" />
				{/each}
			</div>
		{/if}
	</div>
</MediaUpload.Root>
