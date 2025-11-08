<script lang="ts">
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import { User } from '$lib/registry/ui/user';
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

<span data-mention="" class="text-primary underline cursor-pointer hover:opacity-80 {className}" role="button" tabindex="0">
	{#if user}
		<User.Root {ndk} {user}>
			@<User.Name class="inline" field="name" />
		</User.Root>
	{/if}
</span>
