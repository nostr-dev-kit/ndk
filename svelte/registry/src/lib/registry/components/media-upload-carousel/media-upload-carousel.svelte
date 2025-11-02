<!-- @ndk-version: media-upload-carousel@0.0.0 -->
<script lang="ts">
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import type { MediaUploadResult } from '../../ui/media-upload/createMediaUpload.svelte';
	import { MediaUpload } from '../../ui/media-upload/index.js';
	import { getContext } from 'svelte';

	interface Props {
		ndk?: NDKSvelte;
		uploads?: MediaUploadResult[];
		fallbackServer?: string;
		accept?: string;
		maxFiles?: number;
		showProgress?: boolean;
		class?: string;
	}

	let {
		ndk = getContext('ndk'),
		uploads = $bindable([]),
		fallbackServer = 'https://blossom.primal.net',
		accept = '*/*',
		maxFiles,
		showProgress = true,
		class: className = 'flex gap-3 overflow-x-auto pb-2'
	}: Props = $props();

	function handleRemove(index: number) {
		uploads.splice(index, 1);
	}

	function handleReorder(fromIndex: number, toIndex: number) {
		const [removed] = uploads.splice(fromIndex, 1);
		uploads.splice(toIndex, 0, removed);
	}
</script>

<MediaUpload.Root {ndk} {fallbackServer} {accept} {maxFiles} bind:uploads>
	<MediaUpload.Carousel class={className}>
		{#each uploads as upload, i (upload.url)}
			<MediaUpload.Item
				{upload}
				index={i}
				onRemove={handleRemove}
				onReorder={handleReorder}
				class="flex-shrink-0 w-32 h-32 rounded-lg overflow-hidden"
			>
				<MediaUpload.Preview {upload} {showProgress} class="w-full h-full" />
			</MediaUpload.Item>
		{/each}

		<MediaUpload.Button
			multiple
			{accept}
			class="flex-shrink-0 w-32 h-32 rounded-lg border-2 border-dashed border-border bg-muted/50 hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="32"
				height="32"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<path d="M5 12h14" />
				<path d="M12 5v14" />
			</svg>
		</MediaUpload.Button>
	</MediaUpload.Carousel>
</MediaUpload.Root>
