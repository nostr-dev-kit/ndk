<!-- @ndk-version: note-composer@0.1.0 -->
<script lang="ts">
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import type { NDKEvent } from '@nostr-dev-kit/ndk';
	import type { Snippet } from 'svelte';
	import { setContext, getContext } from 'svelte';
	import { createNoteComposer, type NoteComposerOptions } from './createNoteComposer.svelte';
	import { NOTE_COMPOSER_CONTEXT_KEY } from './context.svelte';

	interface Props {
		/** NDK instance (optional, falls back to context) */
		ndk?: NDKSvelte;

		/** Event to reply to (sets kind 1111 and adds reply tags) */
		replyTo?: NDKEvent;

		/** Callback when note is published */
		onPublish?: (event: NDKEvent) => void;

		/** Callback when error occurs */
		onError?: (error: Error) => void;

		/** Additional CSS classes */
		class?: string;

		/** Child components */
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

<div class="note-composer-root {className}">
	{@render children()}
</div>
