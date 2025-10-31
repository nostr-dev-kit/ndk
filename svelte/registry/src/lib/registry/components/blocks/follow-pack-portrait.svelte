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
		<!-- Full-bleed image background with gradient blur effect -->
		<div class="absolute inset-0">
			<!-- Sharp base layer (unblurred) -->
			<FollowPack.Image class="w-full h-full object-cover" showGradient={true} />

			<!-- Blurred layer with gradient mask (sharp at top, blurred at bottom) -->
			<div class="absolute inset-0 pointer-events-none" style="mask-image: linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,1) 100%); -webkit-mask-image: linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,1) 100%);">
				<FollowPack.Image class="w-full h-full object-cover blur-lg" showGradient={true} />
			</div>

			<!-- Darkening gradient overlay for text legibility (darker at bottom) -->
			<div class="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/70"></div>
		</div>

		<!-- Content with relative positioning -->
		<div class="relative flex flex-col flex-1 p-4">
			<!-- Title and description positioned at the bottom, above avatars -->
			<div class="mt-auto space-y-2 mb-3">
				<FollowPack.Title class="text-base font-semibold text-left text-white line-clamp-2" lines={2} />
				<FollowPack.Description class="text-xs text-white/80 text-left line-clamp-2" maxLength={100} lines={2} />
			</div>

			<!-- Avatar group and author on same line -->
			<div class="flex items-center justify-between">
				<AvatarGroup {ndk} pubkeys={followPack.pubkeys} max={4} size={24} />
				{#if followPack.author}
					<div class="flex items-center gap-1 text-xs text-white/70">
						<span>by</span>
						<UserProfile.Name {ndk} user={followPack.author} class="font-medium text-white/90" />
					</div>
				{/if}
			</div>
		</div>
	</button>
</FollowPack.Root>
