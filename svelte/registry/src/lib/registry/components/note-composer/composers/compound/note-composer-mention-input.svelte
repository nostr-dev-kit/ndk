<script lang="ts">
	import type { NDKUser } from '@nostr-dev-kit/ndk';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import { getContext } from 'svelte';
	import { NOTE_COMPOSER_CONTEXT_KEY, type NoteComposerContext } from './note-composer.context';
	import { UserInput } from '../../../ui/user-input/index.js';
	import { User } from '../../../ui/user/index.js';
	import { cn } from '$lib/registry/utils/cn';

	interface Props {
		class?: string;
	}

	let { class: className = '' }: Props = $props();

	const composer = getContext<NoteComposerContext>(NOTE_COMPOSER_CONTEXT_KEY);
	const ndk = getContext<NDKSvelte>('ndk');

	function handleUserSelect(user: NDKUser) {
		composer.addMention(user);
	}
</script>

<div data-note-composer-mention-input="" class={cn('note-composer-mention-input', className)}>
	<UserInput.Root onSelect={handleUserSelect}>
		<UserInput.Search placeholder="Search users to mention..." />
		<UserInput.Results>
			{#snippet children(result)}
				<UserInput.Item {result}>
					<User.Root {ndk} user={result.user}>
						<User.Avatar class="w-8 h-8" />
						<User.Name />
					</User.Root>
				</UserInput.Item>
			{/snippet}
		</UserInput.Results>
	</UserInput.Root>
</div>
