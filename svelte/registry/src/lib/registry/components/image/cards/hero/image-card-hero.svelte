<script lang="ts">
	import type { NDKImage } from '@nostr-dev-kit/ndk';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import { User } from '$lib/registry/ui/user';
	import FollowButton from '../follow-button/follow-button.svelte';
	import { getNDKFromContext } from '$lib/registry/utils/ndk-context.svelte.js';
	import { cn } from '$lib/registry/utils/cn';

	interface Props {
		ndk?: NDKSvelte;

		image: NDKImage;

		height?: string;

		showFollow?: boolean;

		class?: string;
	}

	let {
		ndk: providedNdk,
		image,
		height = 'h-[500px]',
		showFollow = true,
		class: className = ''
	}: Props = $props();

	const ndk = getNDKFromContext(providedNdk);

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
	<div class="hero-content">
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

<style>
	.hero-content {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		padding: 1.5rem;
		background: linear-gradient(
			0deg,
			rgba(0, 0, 0, 0.95) 0%,
			rgba(0, 0, 0, 0.7) 50%,
			transparent 100%
		);
		padding-top: 5rem;
	}
</style>
