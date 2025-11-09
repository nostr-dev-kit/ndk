<script lang="ts">
	import { getContext } from 'svelte';
	import { DropdownMenu } from 'bits-ui';
	import { User } from '../../ui/user';
	import type { SessionSwitcherContext } from './session-switcher.context.js';
	import { SESSION_SWITCHER_CONTEXT_KEY } from './session-switcher.context.js';

	interface Props {
		pubkey: string;
		active?: boolean;
		class?: string;
	}

	let { pubkey, active = false, class: className = '' }: Props = $props();

	const context = getContext<SessionSwitcherContext>(SESSION_SWITCHER_CONTEXT_KEY);
	if (!context) {
		throw new Error('SessionSwitcher.Item must be used within SessionSwitcher.Root');
	}

	const { ndk, switchSession } = context;

	async function handleClick() {
		if (!active) {
			switchSession(pubkey);
		}
	}

	function handleRemove(e: MouseEvent) {
		e.stopPropagation();
		ndk.$sessions.logout(pubkey);
	}
</script>

<DropdownMenu.Item
	class="flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer transition-colors relative text-foreground hover:bg-accent {active ? 'bg-accent' : ''} {className}"
	onclick={handleClick}
>
	<User.Root {ndk} {pubkey}>
		<User.Avatar class="w-9 h-9 flex-shrink-0" />
		<div class="flex-1 min-w-0">
			<User.Name class="text-sm font-medium text-foreground whitespace-nowrap overflow-hidden text-ellipsis block" />
		</div>
	</User.Root>
	{#if active}
		<div class="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0"></div>
	{/if}
	<button
		class="w-5 h-5 flex items-center justify-center rounded hover:bg-accent-foreground/10 transition-colors flex-shrink-0"
		onclick={handleRemove}
		aria-label="Remove session"
	>
		<svg class="w-3 h-3 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
			<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
		</svg>
	</button>
</DropdownMenu.Item>
