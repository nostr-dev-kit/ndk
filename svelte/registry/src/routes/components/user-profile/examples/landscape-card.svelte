<script lang="ts">
	import { UserProfile } from '$lib/components/ndk/user-profile';
	import { FollowButtonPill } from '$lib/components/ndk/blocks';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';

	interface Props {
		ndk: NDKSvelte;
		pubkey: string;
	}

	let { ndk, pubkey }: Props = $props();

	const user = $derived(ndk.getUser({ pubkey }));
</script>

<UserProfile.Root {ndk} {pubkey}>
	<div class="flex gap-4 p-6 bg-card border border-border rounded-xl min-w-96">
		<UserProfile.Avatar size={64} />
		<div class="flex-1 flex flex-col gap-3 min-w-0">
			<div class="flex items-start gap-4">
				<div class="flex flex-col gap-1 items-start flex-1 min-w-0">
					<UserProfile.Name field="displayName" size="lg" />
					<UserProfile.Field field="name" size="sm" class="text-muted-foreground" />
				</div>
				<FollowButtonPill {ndk} target={user} variant="solid" class="shrink-0" />
			</div>
			<UserProfile.Field field="about" maxLines={2} class="text-muted-foreground text-sm leading-relaxed" />
		</div>
	</div>
</UserProfile.Root>
