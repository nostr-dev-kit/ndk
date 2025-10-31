<script lang="ts">
	import type { NDKImage } from '@nostr-dev-kit/ndk';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import { ImageContent } from '$lib/registry/components/image-content';

	interface Props {
		ndk: NDKSvelte;
		image: NDKImage;
	}

	let { ndk, image }: Props = $props();
</script>

<div class="p-4 rounded-lg border border-border bg-card max-w-2xl">
	<ImageContent {ndk} {image} />
</div>
