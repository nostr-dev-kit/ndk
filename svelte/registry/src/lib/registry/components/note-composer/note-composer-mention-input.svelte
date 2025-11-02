<!-- @ndk-version: note-composer@0.1.0 -->
<script lang="ts">
	import type { NDKUser } from '@nostr-dev-kit/ndk';
	import { getContext } from 'svelte';
	import { NOTE_COMPOSER_CONTEXT_KEY, type NoteComposerContext } from './context.svelte';
	import Input from '../../ui/input.svelte';
	import { cn } from '../../utils/index.js';

	interface Props {
		/** Additional CSS classes */
		class?: string;
	}

	let { class: className = '' }: Props = $props();

	const composer = getContext<NoteComposerContext>(NOTE_COMPOSER_CONTEXT_KEY);

	function handleUserSelect(user: NDKUser) {
		composer.addMention(user);
	}
</script>

<div class={cn('note-composer-mention-input', className)}>
	<Input.Root onSelect={handleUserSelect}>
		<Input.Search placeholder="Search users to mention..." />
		<Input.Results>
			{#snippet resultItem(user)}
				<Input.ResultItem {user} />
			{/snippet}
		</Input.Results>
	</Input.Root>
</div>
