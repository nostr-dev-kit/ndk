<script lang="ts">
	import { User } from '$lib/registry/ui/user';
	import FollowButton from '$lib/registry/components/blocks/follow-button.svelte';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';

	interface Props {
		ndk: NDKSvelte;
		pubkey: string;
	}

	let { ndk, pubkey }: Props = $props();

	const user = $derived(ndk.getUser({ pubkey }));
</script>

<User.Root {ndk} {pubkey}>
	<div class="flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-muted">
		<User.Avatar size={48} />
		<div class="flex-1 min-w-0 flex flex-col gap-0.5">
			<User.Name field="displayName" size="md" truncate={true} />
			<User.Field field="name" size="sm" />
		</div>
		<FollowButton {ndk} target={user} class="shrink-0" />
	</div>
</User.Root>
