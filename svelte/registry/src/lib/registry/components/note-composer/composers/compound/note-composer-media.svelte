<script lang="ts">
	import { getContext } from 'svelte';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import { NOTE_COMPOSER_CONTEXT_KEY, type NoteComposerContext } from './note-composer.context';
	import { MediaUpload } from '../../../ui/media-upload';
	import ImageAddIcon from '../../icons/image-add.svelte';
	import { cn } from '../../../utils/cn';

	interface Props {
		ndk?: NDKSvelte;

		fallbackServer?: string;

		accept?: string;

		maxFiles?: number;

		showProgress?: boolean;

		class?: string;
	}

	let {
		ndk: providedNdk,
		fallbackServer = 'https://blossom.primal.net',
		accept = 'image/*,video/*',
		maxFiles,
		showProgress = true,
		class: className = ''
	}: Props = $props();

	const composer = getContext<NoteComposerContext>(NOTE_COMPOSER_CONTEXT_KEY);
	const ndk = providedNdk || getContext<NDKSvelte>('ndk');

	function handleRemove(index: number) {
		composer.uploads.splice(index, 1);
	}

	function handleReorder(fromIndex: number, toIndex: number) {
		const uploads = composer.uploads;
		const [removed] = uploads.splice(fromIndex, 1);
		uploads.splice(toIndex, 0, removed);
	}
</script>

<MediaUpload.Root {ndk} {fallbackServer} {accept} {maxFiles} bind:uploads={composer.uploads}>
	<div data-note-composer-media="" data-has-uploads={composer.uploads.length > 0 ? '' : undefined} class={cn('note-composer-media', className)}>
		{#if composer.uploads.length > 0}
			<MediaUpload.Carousel class="flex gap-3 overflow-x-auto pb-2 mb-2">
				{#each composer.uploads as upload, i (upload.url)}
					<MediaUpload.Item
						{upload}
						index={i}
						onRemove={handleRemove}
						onReorder={handleReorder}
						class="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden"
					>
						<MediaUpload.Preview {upload} {showProgress} class="w-full h-full" />
					</MediaUpload.Item>
				{/each}
			</MediaUpload.Carousel>
		{/if}

		<MediaUpload.Button
			multiple
			{accept}
			class={cn(
				'inline-flex items-center gap-2 px-3 py-1.5 text-sm',
				'border border-border rounded-lg',
				'bg-background hover:bg-muted',
				'text-muted-foreground hover:text-foreground',
				'transition-colors cursor-pointer'
			)}
		>
			<ImageAddIcon class="w-4 h-4" />
			Add media
		</MediaUpload.Button>
	</div>
</MediaUpload.Root>
