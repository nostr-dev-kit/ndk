<script lang="ts">
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import type { NDKFollowPack } from '@nostr-dev-kit/ndk';
	import { FollowPack } from '$lib/registry/ui/follow-pack';
	import AvatarGroup from '$lib/registry/components/misc/avatar-group/avatar-group.svelte';
	import { User } from '$lib/registry/ui/user';
	import { getNDKFromContext } from '$lib/registry/utils/ndk-context.svelte.js';

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
		data-follow-pack-hero=""
		type="button"
		class="group relative w-full h-[400px] rounded-3xl overflow-hidden bg-card hover:shadow-2xl transition-shadow {className}"
	>
		<FollowPack.Image class="absolute inset-0 w-full h-full z-0" showGradient={true} />

		<!-- Gradient overlay for better text readability -->
		<div class="absolute inset-0 z-[5] bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

		<div class="absolute inset-0 z-10 h-full flex flex-col p-8 text-white text-left">
			<!-- Main content at bottom -->
			<div class="space-y-4 flex flex-col h-full justify-end">
				<FollowPack.Title class="text-4xl font-bold text-left" lines={2} />
				<FollowPack.Description class="text-base max-w-2xl text-left" maxLength={200} lines={2} />

				<div class="flex items-center gap-4 text-sm">
					<AvatarGroup {ndk} pubkeys={followPack.pubkeys} max={5} size={32} spacing="loose" />

					{#if followPack.author}
						<User.Root {ndk} user={followPack.author} class="flex-1 flex flex-col items-end">
							<div class="flex items-center gap-2 text-xs opacity-70 mb-auto">
								<User.Avatar class="w-5 h-5" />
								<User.Name class="text-xs" />
							</div>
						</User.Root>
					{/if}
				</div>
			</div>
		</div>
	</button>
</FollowPack.Root>
