<!-- @ndk-version: follow-pack-portrait@0.1.0 -->
<script lang="ts">
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import type { NDKFollowPack } from '@nostr-dev-kit/ndk';
	import { FollowPack } from '../follow-pack';
	import AvatarGroup from '../avatar-group/avatar-group.svelte';
	import { UserProfile } from '../user-profile';
	import { getNDKFromContext } from '../ndk-context.svelte';

	interface Props {
		ndk?: NDKSvelte;
		followPack: NDKFollowPack;
		onclick?: (e: MouseEvent) => void;
		class?: string;
	}

	let { ndk: providedNdk, followPack, onclick, class: className = '' }: Props = $props();

	const ndk = getNDKFromContext(providedNdk);
</script>

<FollowPack.Root {ndk} {followPack} {onclick}>
	<button
		type="button"
		class="group flex flex-col w-[320px] h-[420px] rounded-2xl bg-card hover:bg-muted overflow-hidden transition-colors {className}"
	>
		<FollowPack.Image class="h-56 w-full" showGradient={true} />

		<div class="p-4 flex flex-col flex-1">
			<FollowPack.Title class="text-base font-semibold mb-2" lines={2} />
			<FollowPack.Description class="text-xs text-muted-foreground mb-3" maxLength={100} lines={3} />

			<div class="mt-auto pt-3 border-t border-border space-y-2">
				<AvatarGroup {ndk} pubkeys={followPack.pubkeys} max={4} size={24} />
				<div class="flex items-center gap-2 text-xs text-muted-foreground">
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
					</svg>
					<FollowPack.MemberCount format="long" />
					{#if followPack.pubkey}
						<span>by</span>
						<UserProfile.Name {ndk} pubkey={followPack.pubkey} class="font-medium" />
					{/if}
				</div>
			</div>
		</div>
	</button>
</FollowPack.Root>
