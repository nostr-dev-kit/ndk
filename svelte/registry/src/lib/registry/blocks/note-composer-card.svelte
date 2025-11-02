<!-- @ndk-version: note-composer-card@0.1.0 -->
<!--
  @component NoteComposerCard
  Note composer in a card layout with border and shadow.
  Good for embedding in feeds or pages.

  @example Basic usage
  ```svelte
  <NoteComposerCard {ndk} />
  ```

  @example With reply
  ```svelte
  <NoteComposerCard {ndk} replyTo={event} />
  ```

  @example Custom styling
  ```svelte
  <NoteComposerCard
    {ndk}
    class="max-w-2xl mx-auto"
    onPublish={(event) => console.log('Published:', event)}
  />
  ```
-->
<script lang="ts">
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import type { NDKEvent } from '@nostr-dev-kit/ndk';
	import { NoteComposer } from '../components/note-composer';
	import { cn } from '../utils/index.js';

	interface Props {
		/** NDK instance */
		ndk: NDKSvelte;

		/** Event to reply to */
		replyTo?: NDKEvent;

		/** Callback when note is published */
		onPublish?: (event: NDKEvent) => void;

		/** Callback when error occurs */
		onError?: (error: Error) => void;

		/** Card title */
		title?: string;

		/** Show character count */
		showCount?: boolean;

		/** Show mention input */
		showMentions?: boolean;

		/** Textarea placeholder */
		placeholder?: string;

		/** Additional CSS classes */
		class?: string;
	}

	let {
		ndk,
		replyTo,
		onPublish,
		onError,
		title,
		showCount = false,
		showMentions = true,
		placeholder,
		class: className = ''
	}: Props = $props();

	const cardTitle = $derived(title || (replyTo ? 'Reply' : 'New Note'));
</script>

<div
	class={cn(
		'rounded-lg border bg-card text-card-foreground shadow-sm',
		className
	)}
>
	<div class="p-6">
		{#if cardTitle}
			<h3 class="text-lg font-semibold mb-4">{cardTitle}</h3>
		{/if}

		<NoteComposer.Root {ndk} {replyTo} {onPublish} {onError}>
			<div class="space-y-4">
				<NoteComposer.Textarea {placeholder} {showCount} />

				{#if showMentions}
					<NoteComposer.MentionInput />
				{/if}

				<div class="flex items-center justify-between">
					<NoteComposer.Media />
					<NoteComposer.Submit />
				</div>
			</div>
		</NoteComposer.Root>
	</div>
</div>
