<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import type { NDKFollowPack } from '@nostr-dev-kit/ndk';
	import { setContext } from 'svelte';
	import { getNDKFromContext } from '../../utils/ndk-context.svelte.js';
	import { FOLLOW_PACK_CONTEXT_KEY } from './follow-pack.context.js';
	import type { FollowPackContext } from './follow-pack.context.js';

	interface Props {
		ndk?: NDKSvelte;
		followPack: NDKFollowPack;
		onclick?: (e: MouseEvent) => void;
		class?: string;
		children: Snippet;
	}

	let { ndk: providedNdk, followPack, onclick, class: className = '', children }: Props = $props();

	const ndk = getNDKFromContext(providedNdk);

	const context: FollowPackContext = $state.raw({
		get ndk() {
			return ndk;
		},
		get followPack() {
			return followPack;
		},
		get onclick() {
			return onclick;
		}
	};

	setContext(FOLLOW_PACK_CONTEXT_KEY, context);
</script>

<div class="follow-pack-root {className}">
	{@render children()}
</div>

<style>
	.follow-pack-root {
		display: contents;
	}
</style>
