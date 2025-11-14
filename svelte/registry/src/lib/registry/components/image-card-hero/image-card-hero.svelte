<script lang="ts">
	import type { NDKImage } from '@nostr-dev-kit/ndk';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import { User } from '../../ui/user';
	import FollowButton from '../follow-button/follow-button.svelte';
	import { getNDK } from '../../utils/ndk';
	import { cn } from '../../utils/cn';

	interface Props {
		ndk?: NDKSvelte;

		event: NDKImage;

		height?: string;

		showFollow?: boolean;

		class?: string;
	}

	let {
		ndk: providedNdk,
		event: image,
		height = 'h-[500px]',
		showFollow = true,
		class: className = ''
	}: Props = $props();

	const ndk = getNDK(providedNdk);

	// Get first imeta image
	const imeta = $derived(image.imetas[0]);
	const imageUrl = $derived(imeta?.url);
	const caption = $derived(image.content);
</script>

<div data-image-card-hero="" class={cn('relative overflow-hidden bg-black rounded-2xl w-full', height, className)}>
	<!-- Background Image -->
	<div class="absolute inset-0">
		{#if imageUrl}
			<img src={imageUrl} alt={imeta?.alt || 'Image'} class="w-full h-full object-cover" loading="lazy" />
		{:else}
			<div class="w-full h-full flex items-center justify-center bg-muted">
				<span class="text-6xl text-muted-foreground">📷</span>
			</div>
		{/if}
	</div>

	<!-- Content Overlay -->
	<div class="absolute bottom-0 left-0 right-0 p-6 pt-20 bg-gradient-to-t from-black/95 via-50% via-black/70 to-transparent">
		{#if caption}
			<p class="text-base leading-relaxed mb-4 text-[#ddd]">{caption}</p>
		{/if}

		<div class="flex items-center justify-between gap-4">
			<User.Root {ndk} pubkey={image.pubkey}>
				<div class="flex items-center gap-3">
					<User.Avatar class="w-12 h-12" />
					<User.Name class="font-semibold text-lg" />
				</div>
			</User.Root>

			{#if showFollow}
				<FollowButton {ndk} target={image.pubkey} />
			{/if}
		</div>
	</div>
</div>
