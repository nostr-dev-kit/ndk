<script lang="ts">
	import type { NDKEvent } from '@nostr-dev-kit/ndk';
	import MediaRenderWrapper from '../media-render/MediaRenderWrapper.svelte';
	import MediaBento from '$lib/registry/layouts/media-bento.svelte';

	interface Props {
		url: string | string[];
		event?: NDKEvent;
		class?: string;
	}

	let {
		url,
		event,
		class: className = ''
	}: Props = $props();
</script>

<MediaRenderWrapper {url} {event} class={className}>
	{#snippet children({ url, class: cls })}
		<MediaBento {url} class={cls} />
	{/snippet}
</MediaRenderWrapper>