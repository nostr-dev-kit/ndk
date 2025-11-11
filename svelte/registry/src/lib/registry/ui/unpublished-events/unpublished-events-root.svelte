<script lang="ts">
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import type { Snippet } from 'svelte';
	import { setContext } from 'svelte';
	import { createUnpublishedEvents } from '$lib/registry/builders/unpublished-events/index.svelte.js';
	import { UNPUBLISHED_EVENTS_CONTEXT_KEY } from './unpublished-events.context.js';

	interface Props {
		ndk: NDKSvelte;
		class?: string;
		children: Snippet;
	}

	let { ndk, class: className = '', children }: Props = $props();

	const unpublishedEventsState = createUnpublishedEvents(ndk);

	setContext(UNPUBLISHED_EVENTS_CONTEXT_KEY, unpublishedEventsState);
</script>

<div class={className} data-unpublished-events-root="">
	{@render children()}
</div>
