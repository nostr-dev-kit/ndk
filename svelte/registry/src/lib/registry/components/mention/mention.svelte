<script lang="ts">
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import { User } from '../../ui/user';
    import { NDKUser } from '@nostr-dev-kit/ndk';

	export interface MentionProps {
		ndk: NDKSvelte;
		bech32: string;
		onclick?: (pubkey: string) => void;
		class?: string;
	}

	let { ndk, bech32, onclick, class: className = '' }: MentionProps = $props();

	let user = $state<NDKUser | null>();

	$effect(() => {
		ndk.fetchUser(bech32).then(u => user = u);
	})

	function handleClick(e: MouseEvent) {
		if (onclick && user) {
			e.preventDefault();
			onclick(user.pubkey);
		}
	}
</script>

<span
	data-mention=""
	class="text-primary underline cursor-pointer hover:opacity-80 {className}"
	role="button"
	tabindex="0"
	onclick={handleClick}
	onkeydown={(e) => e.key === 'Enter' && handleClick(e as any)}
>
	{#if user}
		<User.Root {ndk} {user}>
			@<User.Name class="inline" field="name" />
		</User.Root>
	{/if}
</span>
