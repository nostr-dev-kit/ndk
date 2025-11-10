<script lang="ts">
	import type { NDKEvent } from '@nostr-dev-kit/ndk';
	import MediaRenderWrapper from './MediaRenderWrapper.svelte';
	import MediaSimple from '$lib/registry/layouts/media-simple.svelte';

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
		<MediaSimple {url} class={cls} />
	{/snippet}
</MediaRenderWrapper>