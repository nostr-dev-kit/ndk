<script lang="ts">
	import { UserProfile } from '$lib/ndk/user-profile';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';

	interface Props {
		ndk: NDKSvelte;
		pubkey: string;
	}

	let { ndk, pubkey }: Props = $props();
</script>

<UserProfile.Root {ndk} {pubkey}>
	<div class="flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-muted">
		<UserProfile.Avatar size={48} />
		<div class="flex-1 min-w-0 flex flex-col gap-0.5">
			<UserProfile.Name field="displayName" size="md" truncate={true} />
			<UserProfile.Field field="name" size="sm" />
		</div>
		<UserProfile.Follow variant="default" class="shrink-0" />
	</div>
</UserProfile.Root>
