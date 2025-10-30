<!-- @ndk-version: image-card-hero@0.1.0 -->
<!--
  @component ImageCardHero
  Fullbleed hero-style image card with immersive full-height display.
  Caption and author info anchored at bottom over gradient overlay.

  @example
  ```svelte
  <ImageCardHero {ndk} {image} />
  <ImageCardHero {ndk} {image} height="h-[600px]" />
  ```
-->
<script lang="ts">
	import type { NDKImage } from '@nostr-dev-kit/ndk';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import { UserProfile } from '../user-profile';
	import { FollowButton } from './index.js';
	import { getNDKFromContext } from '../ndk-context.svelte.js';
	import { cn } from '$lib/utils';

	interface Props {
		/** NDK instance */
		ndk?: NDKSvelte;

		/** The image event to display */
		image: NDKImage;

		/** Custom height class */
		height?: string;

		/** Show follow button */
		showFollow?: boolean;

		/** Additional CSS classes */
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

<div class={cn('hero-card', height, className)}>
	<!-- Background Image -->
	<div class="hero-image-container">
		{#if imageUrl}
			<img src={imageUrl} alt={imeta?.alt || 'Image'} class="hero-image" loading="lazy" />
		{:else}
			<div class="hero-image-placeholder">
				<span class="text-6xl text-muted-foreground">📷</span>
			</div>
		{/if}
	</div>

	<!-- Content Overlay -->
	<div class="hero-content">
		{#if caption}
			<p class="hero-caption">{caption}</p>
		{/if}

		<div class="hero-author-bar">
			<UserProfile.Root {ndk} pubkey={image.pubkey}>
				<div class="hero-author">
					<UserProfile.Avatar class="w-12 h-12" />
					<div>
						<UserProfile.Name class="font-semibold text-lg" />
						<UserProfile.RelativeTime event={image} class="text-sm opacity-80" />
					</div>
				</div>
			</UserProfile.Root>

			{#if showFollow}
				<FollowButton {ndk} target={image.pubkey} />
			{/if}
		</div>
	</div>
</div>

<style>
	.hero-card {
		position: relative;
		overflow: hidden;
		background: #000;
		border-radius: 1rem;
	}

	.hero-image-container {
		position: absolute;
		inset: 0;
	}

	.hero-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.hero-image-placeholder {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: hsl(var(--muted));
	}

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

	.hero-caption {
		font-size: 1rem;
		line-height: 1.625;
		margin-bottom: 1rem;
		color: #ddd;
	}

	.hero-author-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	.hero-author {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}
</style>
