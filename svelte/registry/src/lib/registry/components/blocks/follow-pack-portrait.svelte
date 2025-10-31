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
		class="group relative flex flex-col w-[320px] h-[420px] rounded-2xl bg-card hover:bg-muted overflow-hidden transition-colors {className}"
	>
		<!-- Full-bleed image background -->
		<div class="absolute inset-0">
			<FollowPack.Image class="w-full h-full object-cover" showGradient={true} />
			<!-- Darkening gradient overlay for text legibility -->
			<div class="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/70"></div>
		</div>

		<!-- Content with relative positioning -->
		<div class="relative flex flex-col flex-1 p-4">
			<FollowPack.Title class="text-base font-semibold mb-2 text-left text-white" lines={2} />
			<FollowPack.Description class="text-xs text-white/80 mb-3 text-left" maxLength={100} lines={3} />

			<div class="mt-auto pt-3 border-t border-white/20 space-y-2">
				<AvatarGroup {ndk} pubkeys={followPack.pubkeys} max={4} size={24} />
				<div class="flex items-center gap-2 text-xs text-white/70">
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
					</svg>
					<FollowPack.MemberCount format="long" />
					{#if followPack.pubkey}
						<span>by</span>
						<UserProfile.Name {ndk} pubkey={followPack.pubkey} class="font-medium text-white/90" />
					{/if}
				</div>
			</div>
		</div>
	</button>
</FollowPack.Root>
