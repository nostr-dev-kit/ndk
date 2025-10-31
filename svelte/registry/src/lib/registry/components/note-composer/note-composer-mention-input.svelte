<!-- @ndk-version: note-composer@0.1.0 -->
<script lang="ts">
	import type { NDKUser } from '@nostr-dev-kit/ndk';
	import { getContext } from 'svelte';
	import { NOTE_COMPOSER_CONTEXT_KEY, type NoteComposerContext } from './context.svelte';
	import { UserInput } from '../user-input';
	import { cn } from '../../../utils';

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
	<UserInput.Root onSelect={handleUserSelect}>
		<UserInput.Search placeholder="Search users to mention..." />
		<UserInput.Results>
			{#snippet resultItem(user)}
				<UserInput.ResultItem {user} />
			{/snippet}
		</UserInput.Results>
	</UserInput.Root>
</div>
