<script lang="ts">
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import type { NDKFollowPack } from '@nostr-dev-kit/ndk';
	import { FollowPack } from '$lib/registry/ui/follow-pack';

	interface Props {
		ndk: NDKSvelte;
		followPack: NDKFollowPack;
	}

	let { ndk, followPack }: Props = $props();
</script>

<FollowPack.Root {ndk} {followPack}>
	<div class="p-4 bg-card rounded-lg">
		<FollowPack.Title class="text-lg font-semibold" />
		<FollowPack.Description class="text-sm text-muted-foreground mt-2" />
		<FollowPack.MemberCount class="text-xs text-muted-foreground mt-2" format="long" />
	</div>
</FollowPack.Root>
