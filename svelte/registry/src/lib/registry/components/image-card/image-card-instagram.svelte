<script lang="ts">
	import type { NDKImage } from '@nostr-dev-kit/ndk';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import { User } from '../../ui/user';
	import { getNDKFromContext } from '../../utils/ndk-context.svelte.js';
	import RepostButton from '../actions/repost-button.svelte';
	import { ReactionButton } from '../reaction/index.js';
	// import { ZapButton } from '../../components/zap/index.js'; // TODO: Add ZapButton when available
	import { cn } from '../../utils/index.js';

	interface Props {
		/** NDK instance */
		ndk?: NDKSvelte;

		/** The image event to display */
		image: NDKImage;

		/** Show dropdown menu */
		showDropdown?: boolean;

		/** Additional CSS classes */
		class?: string;
	}

	let {
		ndk: providedNdk,
		image,
		showDropdown = true,
		class: className = ''
	}: Props = $props();

	const ndk = getNDKFromContext(providedNdk);

	// Get first imeta image
	const imeta = $derived(image.imetas[0]);
	const imageUrl = $derived(imeta?.url);
	const caption = $derived(image.content);
</script>

<div class={cn('instagram-card', className)}>
	<!-- Header -->
	<div class="instagram-header">
		<User.Root {ndk} pubkey={image.pubkey}>
			<div class="instagram-user-info">
				<User.Avatar class="w-10 h-10" />
				<User.Name class="font-semibold text-sm" />
			</div>
		</User.Root>

		{#if showDropdown}
			<button class="instagram-menu-btn" aria-label="Options">
				<svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
					<circle cx="12" cy="12" r="2" />
					<circle cx="19" cy="12" r="2" />
					<circle cx="5" cy="12" r="2" />
				</svg>
			</button>
		{/if}
	</div>

	<!-- Image -->
	<div class="instagram-image-container">
		{#if imageUrl}
			<img src={imageUrl} alt={imeta?.alt || 'Image'} class="instagram-image" loading="lazy" />
		{:else}
			<div class="instagram-image-placeholder">
				<span class="text-4xl text-muted-foreground">📷</span>
			</div>
		{/if}
	</div>

	<!-- Actions -->
	<div class="instagram-actions">
		<ReactionButton {ndk} event={image} />
		<RepostButton {ndk} event={image} />
		<!-- <ZapButton {ndk} event={image} /> -->
	</div>

	<!-- Caption -->
	{#if caption}
		<div class="instagram-caption">
			<User.Root {ndk} pubkey={image.pubkey}>
				<User.Name class="font-semibold text-sm inline" />
			</User.Root>
			<span class="text-sm ml-2">{caption}</span>
		</div>
	{/if}
</div>

<style>
	.instagram-card {
		background-color: hsl(var(--card));
		border: 1px solid hsl(var(--border));
		border-radius: 0.75rem;
		overflow: hidden;
	}

	.instagram-header {
		padding: 0.75rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		border-bottom: 1px solid hsl(var(--border));
	}

	.instagram-user-info {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex: 1;
	}

	.instagram-menu-btn {
		padding: 0.5rem;
		border-radius: 9999px;
		transition: background-color 0.2s;
		background: none;
		border: none;
		color: var(--foreground);
		cursor: pointer;
	}

	.instagram-menu-btn:hover {
		background-color: hsl(var(--accent));
	}

	.instagram-image-container {
		position: relative;
		width: 100%;
		aspect-ratio: 1;
		background-color: hsl(var(--muted));
	}

	.instagram-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.instagram-image-placeholder {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.instagram-actions {
		padding: 0.75rem 1rem;
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.instagram-caption {
		padding: 0 1rem 1rem;
		font-size: 0.875rem;
		line-height: 1.625;
	}
</style>
