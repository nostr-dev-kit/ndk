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

<div class="flex flex-col gap-6 max-w-3xl">
	<!-- With all metadata -->
	<div class="p-6 rounded-lg border border-border bg-card">
		<h4 class="text-lg font-semibold mb-4">With All Metadata</h4>
		<ImageContent {ndk} {image} showMeta={true} showAlt={true} imageClass="max-h-96 rounded-lg" />
	</div>

	<!-- Without metadata -->
	<div class="p-6 rounded-lg border border-border bg-card">
		<h4 class="text-lg font-semibold mb-4">Without Metadata</h4>
		<ImageContent {ndk} {image} showMeta={false} showAlt={false} imageClass="max-h-96 rounded-lg" />
	</div>

	<!-- Compact layout -->
	<div class="p-6 rounded-lg border border-border bg-card">
		<h4 class="text-lg font-semibold mb-4">Compact Layout</h4>
		<ImageContent {ndk} {image} showMeta={true} showAlt={false} imageClass="max-h-64 rounded-lg" />
	</div>
</div>
