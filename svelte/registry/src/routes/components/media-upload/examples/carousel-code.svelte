<script lang="ts">
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import type { MediaUploadResult } from '$lib/registry/components/media-upload';
	import { MediaUpload } from '$lib/registry/components/media-upload';

	interface Props {
		ndk: NDKSvelte;
		uploads: MediaUploadResult[];
	}

	let { ndk, uploads = $bindable([]) }: Props = $props();

	function handleRemove(index: number) {
		uploads.splice(index, 1);
	}

	function handleReorder(fromIndex: number, toIndex: number) {
		const [removed] = uploads.splice(fromIndex, 1);
		uploads.splice(toIndex, 0, removed);
	}
</script>

<MediaUpload.Root {ndk} fallbackServer="https://blossom.primal.net" bind:uploads>
	<MediaUpload.Carousel class="flex gap-3 overflow-x-auto pb-2">
		{#each uploads as upload, i (upload.url)}
			<MediaUpload.Item
				{upload}
				index={i}
				onRemove={handleRemove}
				onReorder={handleReorder}
				class="flex-shrink-0 w-32 h-32 rounded-lg overflow-hidden"
			>
				<MediaUpload.Preview {upload} class="w-full h-full" />
			</MediaUpload.Item>
		{/each}

		<MediaUpload.Button
			multiple
			accept="*/*"
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
