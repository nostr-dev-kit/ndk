<script lang="ts">
	import { setContext } from 'svelte';
	import { DropdownMenu } from 'bits-ui';
	import type { NDKSvelteWithSession } from '@nostr-dev-kit/svelte';
	import type { SessionSwitcherContext } from './session-switcher.context.js';
	import { SESSION_SWITCHER_CONTEXT_KEY } from './session-switcher.context.js';

	interface Props {
		ndk: NDKSvelteWithSession;
		children?: import('svelte').Snippet;
		open?: boolean;
		onOpenChange?: (open: boolean) => void;
	}

	let { ndk, children, open = $bindable(false), onOpenChange }: Props = $props();

	async function switchSession(pubkey: string) {
		await ndk.$sessions.switch(pubkey);
		open = false;
	}

	setContext(SESSION_SWITCHER_CONTEXT_KEY, { ndk, switchSession });

	function handleOpenChange(newOpen: boolean) {
		open = newOpen;
		onOpenChange?.(newOpen);
	}
</script>

<DropdownMenu.Root bind:open onOpenChange={handleOpenChange}>
	{#if children}
		{@render children()}
	{/if}
</DropdownMenu.Root>
