<script lang="ts">
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import type { NDKFollowPack } from '@nostr-dev-kit/ndk';
	import { FollowPack } from '$lib/registry/components/follow-pack';

	interface Props {
		ndk: NDKSvelte;
		followPack: NDKFollowPack;
	}

	let { ndk, followPack }: Props = $props();
</script>

<FollowPack.Root {ndk} {followPack}>
	<button
		type="button"
		class="group flex items-center gap-4 w-full p-4 rounded-xl bg-card hover:bg-muted transition-colors"
	>
		<FollowPack.Image class="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden" />

		<div class="flex-1 min-w-0 text-left">
			<FollowPack.Title class="text-sm font-semibold mb-1" lines={1} />
			<FollowPack.Description class="text-xs text-muted-foreground mb-2" maxLength={80} lines={2} />

			<div class="flex items-center gap-1.5 text-xs text-muted-foreground">
				<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
				</svg>
				<FollowPack.MemberCount format="long" />
			</div>
		</div>
	</button>
</FollowPack.Root>
