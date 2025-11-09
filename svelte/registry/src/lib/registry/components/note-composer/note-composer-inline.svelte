<script lang="ts">
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import type { NDKEvent } from '@nostr-dev-kit/ndk';
	import { NoteComposer } from './index';
	import { cn } from '../../utils/cn';

	interface Props {
		ndk: NDKSvelte;

		replyTo?: NDKEvent;

		onPublish?: (event: NDKEvent) => void;

		onError?: (error: Error) => void;

		showCount?: boolean;

		showMentions?: boolean;

		placeholder?: string;

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
	<div data-note-composer-inline="" class={cn('space-y-3', className)}>
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
