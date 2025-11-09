<script lang="ts">
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import type { NDKEvent } from '@nostr-dev-kit/ndk';
	import { NoteComposer } from './index';
	import { cn } from '../../../../utils/cn';

	interface Props {
		ndk: NDKSvelte;

		replyTo?: NDKEvent;

		onPublish?: (event: NDKEvent) => void;

		onError?: (error: Error) => void;

		title?: string;

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
		title,
		showCount = false,
		showMentions = true,
		placeholder,
		class: className = ''
	}: Props = $props();

	const cardTitle = $derived(title || (replyTo ? 'Reply' : 'New Note'));
</script>

<div
	data-note-composer-card=""
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
