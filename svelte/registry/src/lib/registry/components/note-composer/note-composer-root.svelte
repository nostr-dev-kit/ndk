<script lang="ts">
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import type { NDKEvent } from '@nostr-dev-kit/ndk';
	import type { Snippet } from 'svelte';
	import { setContext, getContext } from 'svelte';
	import { createNoteComposer, type NoteComposerOptions } from './createNoteComposer.svelte';
	import { NOTE_COMPOSER_CONTEXT_KEY } from './note-composer.context';

	interface Props {
		ndk?: NDKSvelte;

		replyTo?: NDKEvent;

		onPublish?: (event: NDKEvent) => void;

		onError?: (error: Error) => void;

		class?: string;

		children: Snippet;
	}

	let {
		ndk: providedNdk,
		replyTo,
		onPublish,
		onError,
		class: className = '',
		children
	}: Props = $props();

	const ndk = providedNdk || getContext<NDKSvelte>('ndk');

	const options: NoteComposerOptions = {
		replyTo,
		onPublish,
		onError
	};

	const composer = createNoteComposer(ndk, options);

	setContext(NOTE_COMPOSER_CONTEXT_KEY, composer);
</script>

<div data-note-composer-root="" class="note-composer-root {className}">
	{@render children()}
</div>
