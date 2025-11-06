<script lang="ts">
	import type { NDKImage } from '@nostr-dev-kit/ndk';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import { User } from '$lib/registry/ui/user';
	import FollowButton from '$lib/registry/components/follow-button.svelte';

	interface Props {
		ndk: NDKSvelte;
		image: NDKImage;
	}

	let { ndk, image }: Props = $props();

	const imeta = $derived(image.imetas[0]);
	const imageUrl = $derived(imeta?.url);
	const caption = $derived(image.content);
</script>

<div class="relative h-[500px] rounded-2xl overflow-hidden bg-black">
	<!-- Background Image -->
	<div class="absolute inset-0">
		{#if imageUrl}
			<img src={imageUrl} alt={imeta?.alt || 'Image'} class="w-full h-full object-cover" />
		{/if}
	</div>

	<!-- Content Overlay -->
	<div
		class="absolute bottom-0 left-0 right-0 p-6"
		style="background: linear-gradient(0deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 50%, transparent 100%); padding-top: 5rem;"
	>
		{#if caption}
			<p class="text-base leading-relaxed mb-4" style="color: #ddd;">{caption}</p>
		{/if}

		<div class="flex items-center justify-between gap-4">
			<User.Root {ndk} pubkey={image.pubkey}>
				<div class="flex items-center gap-3">
					<User.Avatar class="w-12 h-12" />
					<div>
						<User.Name class="font-semibold text-lg" />
						<User.RelativeTime event={image} class="text-sm opacity-80" />
					</div>
				</div>
			</User.Root>

			<FollowButton {ndk} target={image.pubkey} />
		</div>
	</div>
</div>
