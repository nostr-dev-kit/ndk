<!-- @ndk-version: follow-pack-modern-portrait@0.1.0 -->
<script lang="ts">
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import type { NDKFollowPack } from '@nostr-dev-kit/ndk';
	import { FollowPack } from '../../ui/follow-pack';
	import { User } from '../../ui/user';
	import { getNDKFromContext } from '../../utils/ndk-context.svelte.js';

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
		class="group relative w-[320px] h-[460px] rounded-3xl overflow-hidden bg-card transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 {className}"
	>
		<!-- Image with full bleed -->
		<div class="absolute inset-0 w-full h-full">
			<FollowPack.Image class="w-full h-full" />

			<!-- Glossy gradient overlay for text readability -->
			<div
				class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent backdrop-blur-sm"
			></div>
		</div>

		<!-- Content container -->
		<div class="relative h-full flex flex-col justify-between p-6 text-white">
			<!-- Top section: Title and member count -->
			<div class="space-y-3">
				<FollowPack.Title
					class="text-2xl font-bold leading-tight drop-shadow-lg"
					lines={2}
				/>
				<div
					class="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md rounded-full px-3 py-1.5 border border-white/20 w-fit"
				>
					<svg
						class="w-4 h-4"
						fill="currentColor"
						viewBox="0 0 24 24"
					>
						<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" ></path>
					</svg>
					<FollowPack.MemberCount format="short" />
				</div>
			</div>

			<!-- Bottom section: Author info with glass effect -->
			<div
				class="flex items-center gap-3 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/20"
			>
				{#if followPack.pubkey}
					<User.Root {ndk} pubkey={followPack.pubkey}>
						<div class="flex items-center gap-2 min-w-0 flex-1">
							<User.Avatar class="flex-shrink-0 w-10 h-10" />
							<div class="min-w-0 flex-1">
								<div class="text-xs font-semibold truncate">
									<User.Name field="displayName" />
								</div>
								<div class="text-xs text-white/70 truncate">
									Pack creator
								</div>
							</div>
						</div>
					</User.Root>
				{/if}
			</div>
		</div>

		<!-- Subtle shine effect on hover -->
		<div
			class="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-3xl"
		></div>
	</button>
</FollowPack.Root>
