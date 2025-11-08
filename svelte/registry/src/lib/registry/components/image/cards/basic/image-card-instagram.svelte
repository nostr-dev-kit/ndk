<script lang="ts">
	import type { NDKImage } from '@nostr-dev-kit/ndk';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import { User } from '../../../../ui/user';
	import { getNDKFromContext } from '../../../../utils/ndk-context.svelte.js';
	import RepostButton from '../../../repost/buttons/basic/repost-button.svelte';
	import { ReactionLongpress } from '../../../reaction/index.js';
	// import { ZapButton } from '../zap/index.js'; // TODO: Add ZapButton when available
	import { cn } from '../../../../utils/cn';

	interface Props {
		ndk?: NDKSvelte;

		image: NDKImage;

		showDropdown?: boolean;

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

<div data-image-card-instagram=""
    class={cn('bg-card border border-border rounded-xl overflow-hidden', className)}>
	<!-- Header -->
	<div class="p-3 flex items-center justify-between border-b border-border">
		<User.Root {ndk} pubkey={image.pubkey}>
			<div class="flex items-center gap-3 flex-1">
				<User.Avatar class="w-10 h-10" />
				<User.Name class="font-semibold text-sm" />
			</div>
		</User.Root>

		{#if showDropdown}
			<button class="p-2 rounded-full transition-colors bg-none border-none text-foreground cursor-pointer hover:bg-accent">
				<svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
					<circle cx="12" cy="12" r="2" ></circle>
					<circle cx="19" cy="12" r="2" ></circle>
					<circle cx="5" cy="12" r="2" ></circle>
				</svg>
			</button>
		{/if}
	</div>

	<!-- Image -->
	<div class="relative w-full aspect-square bg-muted">
		{#if imageUrl}
			<img src={imageUrl} alt={imeta?.alt || 'Image'} class="w-full h-full object-cover" loading="lazy" />
		{:else}
			<div class="w-full h-full flex items-center justify-center">
				<span class="text-4xl text-muted-foreground">📷</span>
			</div>
		{/if}
	</div>

	<!-- Actions -->
	<div class="p-3 px-4 flex items-center gap-4">
		<ReactionLongpress {ndk} event={image} />
		<RepostButton {ndk} event={image} />
		<!-- <ZapButton {ndk} event={image} /> -->
	</div>

	<!-- Caption -->
	{#if caption}
		<div class="px-4 pb-4 text-sm leading-relaxed">
			<User.Root {ndk} pubkey={image.pubkey}>
				<User.Name class="font-semibold text-sm inline" />
			</User.Root>
			<span class="text-sm ml-2">{caption}</span>
		</div>
	{/if}
</div>
