<script lang="ts">
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import type { NDKEvent } from '@nostr-dev-kit/ndk';
	import { NoteComposer } from '../../components/note-composer';
	import { cn } from '../../utils/cn.js';

	interface Props {
		ndk: NDKSvelte;

		replyTo?: NDKEvent;

		onPublish?: (event: NDKEvent) => void;

		onError?: (error: Error) => void;

		placeholder?: string;

		showCount?: boolean;

		buttonSize?: 'sm' | 'md' | 'lg';

		buttonVariant?: 'default' | 'outline' | 'ghost';

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
	<div data-note-composer-minimal="" class={cn('space-y-2', className)}>
		<NoteComposer.Textarea {placeholder} {showCount} minRows={2} />

		<div class="flex justify-end">
			<NoteComposer.Submit size={buttonSize} variant={buttonVariant} />
		</div>
	</div>
</NoteComposer.Root>
