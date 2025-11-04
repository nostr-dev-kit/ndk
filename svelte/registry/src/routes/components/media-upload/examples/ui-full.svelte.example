<script lang="ts">
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import type { MediaUploadResult } from '$lib/registry/ui/media-upload';
	import { MediaUpload } from '$lib/registry/ui/media-upload';

	interface Props {
		ndk: NDKSvelte;
	}

	let { ndk }: Props = $props();

	let uploads = $state<MediaUploadResult[]>([]);

	function handleRemove(index: number) {
		uploads.splice(index, 1);
	}

	function handleReorder(fromIndex: number, toIndex: number) {
		const [removed] = uploads.splice(fromIndex, 1);
		uploads.splice(toIndex, 0, removed);
	}
</script>

<MediaUpload.Root {ndk} accept="image/*,video/*,audio/*" maxFiles={10} bind:uploads>
	<div class="space-y-4">
		<div class="flex items-center justify-between">
			<h3 class="text-lg font-semibold">Media Gallery</h3>
			<MediaUpload.Button
				class="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
			>
				Add Media
			</MediaUpload.Button>
		</div>

		{#if uploads.length > 0}
			<MediaUpload.Carousel class="flex gap-4 overflow-x-auto pb-4">
				{#each uploads as upload, i (upload.url)}
					<MediaUpload.Item
						{upload}
						index={i}
						onRemove={handleRemove}
						onReorder={handleReorder}
						class="flex-shrink-0 w-48 h-48 rounded-lg overflow-hidden border border-border hover:border-primary transition-colors cursor-move"
					>
						<MediaUpload.Preview {upload} showProgress class="w-full h-full" />
					</MediaUpload.Item>
				{/each}
			</MediaUpload.Carousel>

			<div class="text-sm text-muted-foreground">
				{uploads.length} file{uploads.length === 1 ? '' : 's'} uploaded
			</div>
		{:else}
			<div class="border-2 border-dashed border-border rounded-lg p-12 text-center">
				<p class="text-muted-foreground mb-4">No media uploaded yet</p>
				<MediaUpload.Button
					class="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium"
				>
					Upload Your First File
				</MediaUpload.Button>
			</div>
		{/if}
	</div>
</MediaUpload.Root>
