<!-- @ndk-version: note-composer-minimal@0.1.0 -->
<!--
  @component NoteComposerMinimal
  Minimal note composer with just textarea and submit button.
  No media uploads or mention input - just simple text notes.

  @example Basic usage
  ```svelte
  <NoteComposerMinimal {ndk} />
  ```

  @example With reply
  ```svelte
  <NoteComposerMinimal {ndk} replyTo={event} />
  ```

  @example Quick replies
  ```svelte
  <NoteComposerMinimal
    {ndk}
    replyTo={event}
    placeholder="Quick reply..."
    buttonSize="sm"
  />
  ```
-->
<script lang="ts">
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import type { NDKEvent } from '@nostr-dev-kit/ndk';
	import { NoteComposer } from '../components/note-composer';
	import { cn } from '../../utils';

	interface Props {
		/** NDK instance */
		ndk: NDKSvelte;

		/** Event to reply to */
		replyTo?: NDKEvent;

		/** Callback when note is published */
		onPublish?: (event: NDKEvent) => void;

		/** Callback when error occurs */
		onError?: (error: Error) => void;

		/** Textarea placeholder */
		placeholder?: string;

		/** Show character count */
		showCount?: boolean;

		/** Button size */
		buttonSize?: 'sm' | 'md' | 'lg';

		/** Button variant */
		buttonVariant?: 'default' | 'outline' | 'ghost';

		/** Additional CSS classes */
		class?: string;
	}

	let {
		ndk,
		replyTo,
		onPublish,
		onError,
		placeholder,
		showCount = false,
		buttonSize = 'md',
		buttonVariant = 'default',
		class: className = ''
	}: Props = $props();
</script>

<NoteComposer.Root {ndk} {replyTo} {onPublish} {onError}>
	<div class={cn('space-y-2', className)}>
		<NoteComposer.Textarea {placeholder} {showCount} minRows={2} />

		<div class="flex justify-end">
			<NoteComposer.Submit size={buttonSize} variant={buttonVariant} />
		</div>
	</div>
</NoteComposer.Root>
