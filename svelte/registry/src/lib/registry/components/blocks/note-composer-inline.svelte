<!-- @ndk-version: note-composer-inline@0.1.0 -->
<!--
  @component NoteComposerInline
  Inline note composer with all features in a compact layout.
  Supports creating new notes or replying to existing ones.

  @example Basic usage
  ```svelte
  <NoteComposerInline {ndk} />
  ```

  @example With reply
  ```svelte
  <NoteComposerInline {ndk} replyTo={event} />
  ```

  @example With callbacks
  ```svelte
  <NoteComposerInline
    {ndk}
    onPublish={(event) => console.log('Published:', event)}
    onError={(error) => console.error('Error:', error)}
  />
  ```
-->
<script lang="ts">
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import type { NDKEvent } from '@nostr-dev-kit/ndk';
	import { NoteComposer } from '../note-composer';
	import { cn } from '../../../utils';

	interface Props {
		/** NDK instance */
		ndk: NDKSvelte;

		/** Event to reply to */
		replyTo?: NDKEvent;

		/** Callback when note is published */
		onPublish?: (event: NDKEvent) => void;

		/** Callback when error occurs */
		onError?: (error: Error) => void;

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
		showCount = false,
		showMentions = true,
		placeholder,
		class: className = ''
	}: Props = $props();
</script>

<NoteComposer.Root {ndk} {replyTo} {onPublish} {onError}>
	<div class={cn('space-y-3', className)}>
		<NoteComposer.Textarea {placeholder} {showCount} autofocus />

		{#if showMentions}
			<NoteComposer.MentionInput />
		{/if}

		<div class="flex items-center justify-between">
			<NoteComposer.Media />
			<NoteComposer.Submit />
		</div>
	</div>
</NoteComposer.Root>
