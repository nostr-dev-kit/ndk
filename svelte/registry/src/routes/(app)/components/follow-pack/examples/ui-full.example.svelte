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
	<div class="bg-card rounded-xl overflow-hidden shadow-md max-w-md">
		<FollowPack.Image class="w-full h-48" showGradient={true} />

		<div class="p-6">
			<FollowPack.Title class="text-xl font-bold mb-3" />
			<FollowPack.Description class="text-sm text-muted-foreground mb-4" maxLength={150} />

			<div class="flex items-center justify-between pt-4 border-t border-border">
				<div class="flex items-center gap-2 text-sm">
					<svg class="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" ></path>
					</svg>
					<FollowPack.MemberCount class="text-muted-foreground" format="long" />
				</div>
			</div>
		</div>
	</div>
</FollowPack.Root>
