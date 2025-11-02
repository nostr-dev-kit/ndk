<!-- @ndk-version: follow-pack-hero@0.2.0 -->
<script lang="ts">
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import type { NDKFollowPack } from '@nostr-dev-kit/ndk';
	import { FollowPack } from '../components/follow-pack';
	import AvatarGroup from '../components/avatar-group/avatar-group.svelte';
	import { User } from '../ui/user';
	import { getNDKFromContext } from '../components/ndk-context.svelte';

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
		class="group relative w-full h-[400px] rounded-3xl overflow-hidden bg-card hover:shadow-2xl transition-shadow {className}"
	>
		<FollowPack.Image class="absolute inset-0 w-full h-full z-0" showGradient={true} />

		<!-- Gradient overlay for better text readability -->
		<div class="absolute inset-0 z-[5] bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

		<div class="absolute inset-0 z-10 h-full flex flex-col p-8 text-white text-left">
			<!-- Author at top, subtle -->
			{#if followPack.author}
				<div class="flex items-center gap-2 text-xs opacity-70 mb-auto">
					<User.Avatar {ndk} user={followPack.author} size={20} class="ring-1 ring-white/30" />
					<User.Name {ndk} user={followPack.author} />
				</div>
			{/if}

			<!-- Main content at bottom -->
			<div class="space-y-4">
				<FollowPack.Title class="text-4xl font-bold text-left" lines={2} />
				<FollowPack.Description class="text-base max-w-2xl text-left" maxLength={200} lines={2} />

				<div class="flex items-center gap-4 text-sm">
					<AvatarGroup {ndk} pubkeys={followPack.pubkeys} max={5} size={32} />
					<div class="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
						</svg>
						<FollowPack.MemberCount format="long" />
					</div>
				</div>
			</div>
		</div>
	</button>
</FollowPack.Root>
