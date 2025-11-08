<script lang="ts">
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import type { NDKFollowPack } from '@nostr-dev-kit/ndk';
	import { FollowPack } from '$lib/registry/ui/follow-pack';
	import { User } from '$lib/registry/ui/user';

	interface Props {
		ndk?: NDKSvelte;
		followPack: NDKFollowPack;
		onclick?: (e: MouseEvent) => void;
		class?: string;
	}

	let { ndk, followPack, onclick, class: className = '' }: Props = $props();
</script>

<FollowPack.Root {ndk} {followPack} {onclick}>
	<button
		data-follow-pack-list-item=""
		type="button"
		class="group flex items-center gap-3 w-full py-3 px-2 hover:bg-muted rounded-lg transition-colors {className}"
	>
		<FollowPack.Image class="w-12 h-12 flex-shrink-0 rounded-full overflow-hidden" />

		<div class="flex-1 min-w-0 text-left">
			<FollowPack.Title class="text-sm font-medium" lines={1} />
			<div class="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
				<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" ></path>
				</svg>
				<FollowPack.MemberCount format="short" />
			</div>
		</div>

		<svg
			class="w-5 h-5 text-muted-foreground flex-shrink-0 group-hover:translate-x-1 transition-transform"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
		>
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" ></path>
		</svg>
	</button>
</FollowPack.Root>
