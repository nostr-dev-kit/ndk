<script lang="ts">
	import type { NDKImage } from '@nostr-dev-kit/ndk';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import { UserProfile } from '$lib/registry/components/user-profile';
	import RepostButton from '$lib/registry/components/blocks/repost-button.svelte';
	import ReactionButton from '$lib/registry/components/blocks/reaction-button.svelte';
import ZapButton from '$lib/registry/components/blocks/zap-button.svelte';
	import { DotsHorizontalIcon } from '@hugeicons/core-free-icons';
	import { HugeiconsIcon } from '@hugeicons/svelte';

	interface Props {
		ndk: NDKSvelte;
		image: NDKImage;
	}

	let { ndk, image }: Props = $props();

	const imeta = $derived(image.imetas[0]);
	const imageUrl = $derived(imeta?.url);
	const caption = $derived(image.content);
</script>

<div class="bg-card border border-border rounded-xl overflow-hidden">
	<!-- Header -->
	<div class="p-3 flex items-center justify-between border-b border-border">
		<UserProfile.Root {ndk} pubkey={image.pubkey}>
			<div class="flex items-center gap-3 flex-1">
				<UserProfile.Avatar class="w-10 h-10" />
				<div class="flex-1">
					<UserProfile.Name class="font-semibold text-sm" />
					<UserProfile.RelativeTime event={image} class="text-xs text-muted-foreground" />
				</div>
			</div>
		</UserProfile.Root>

		<button class="p-2 hover:bg-accent rounded-full" aria-label="Options">
			<HugeiconsIcon icon={DotsHorizontalIcon} size={20} />
		</button>
	</div>

	<!-- Image -->
	<div class="relative w-full aspect-square bg-muted">
		{#if imageUrl}
			<img src={imageUrl} alt={imeta?.alt || 'Image'} class="w-full h-full object-cover" />
		{/if}
	</div>

	<!-- Actions -->
	<div class="px-4 py-3 flex items-center gap-4">
		<ReactionButton {ndk} event={image} />
		<RepostButton {ndk} event={image} />
		<ZapButton {ndk} event={image} />
	</div>

	<!-- Caption -->
	{#if caption}
		<div class="px-4 pb-4 text-sm leading-relaxed">
			<UserProfile.Root {ndk} pubkey={image.pubkey}>
				<UserProfile.Name class="font-semibold text-sm inline" />
			</UserProfile.Root>
			<span class="ml-2">{caption}</span>
		</div>
	{/if}
</div>
