<script lang="ts">
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import type { NDKFollowPack } from '@nostr-dev-kit/ndk';
	import { FollowPack } from '../../ui/follow-pack';
	import AvatarGroup from '../avatar-group/avatar-group.svelte';
	import { User } from '../../ui/user';
	import { getNDK } from '../../utils/ndk';

	interface Props {
		ndk?: NDKSvelte;
		followPack: NDKFollowPack;
		onclick?: (e: MouseEvent) => void;
		class?: string;
	}

	let { ndk: providedNdk, followPack, onclick, class: className = '' }: Props = $props();

	const ndk = getNDK(providedNdk);
</script>

<FollowPack.Root {ndk} {followPack} {onclick}>
	<button
		data-follow-pack-portrait=""
		type="button"
		class="group relative flex flex-col w-[320px] h-[420px] rounded-2xl bg-card hover:bg-muted overflow-hidden transition-colors {className}"
	>
		<!-- Full-bleed image background -->
		<div class="absolute inset-0">
			<FollowPack.Image class="w-full h-full object-cover" showGradient={true} />
			<!-- Darkening gradient overlay for text legibility -->
			<div class="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/90"></div>
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
					<User.Root {ndk} user={followPack.author}>
						<div class="flex items-center gap-1 text-xs text-white/70">
							<span>by</span>
							<User.Name field="displayName" class="text-xs font-medium text-white/90" />
						</div>
					</User.Root>
				{/if}
			</div>
		</div>
	</button>
</FollowPack.Root>
