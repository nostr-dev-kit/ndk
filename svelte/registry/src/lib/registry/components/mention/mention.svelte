<!-- @ndk-version: mention-preview@0.7.0 -->
<script lang="ts">
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import { User } from '../../ui/user';
    import { NDKUser } from '@nostr-dev-kit/ndk';

	interface MentionProps {
		ndk: NDKSvelte;
		bech32: string;
		class?: string;
	}

	let { ndk, bech32, class: className = '' }: MentionProps = $props();

	let user = $state<NDKUser | null>();

	$effect(() => {
		ndk.fetchUser(bech32).then(u => user = u);
	})
</script>

<span data-mention="" class="mention {className}" role="button" tabindex="0">
	{#if user}
		<User.Root {ndk} {user}>
			@<User.Name class="inline" field="name" />
		</User.Root>
	{/if}
</span>

<style>
	.mention {
		color: var(--primary);
		text-decoration: underline;
		cursor: pointer;
	}

	.mention:hover {
		opacity: 0.8;
	}
</style>
