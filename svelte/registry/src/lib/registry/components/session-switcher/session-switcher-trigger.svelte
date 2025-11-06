<script lang="ts">
	import { getContext } from 'svelte';
	import { DropdownMenu } from 'bits-ui';
	import { User } from '$lib/registry/ui/user';
	import type { SessionSwitcherContext } from './session-switcher.context.js';
	import { SESSION_SWITCHER_CONTEXT_KEY } from './session-switcher.context.js';

	interface Props {
		variant?: 'full' | 'compact';
		class?: string;
	}

	let { variant = 'full', class: className = '' }: Props = $props();

	const context = getContext<SessionSwitcherContext>(SESSION_SWITCHER_CONTEXT_KEY);
	if (!context) {
		throw new Error('SessionSwitcher.Trigger must be used within SessionSwitcher.Root');
	}

	const { ndk } = context;

	function truncateNpub(npub: string): string {
		if (!npub) return '';
		return `${npub.slice(0, 9)}...${npub.slice(-4)}`;
	}
</script>

<DropdownMenu.Trigger
	class="{variant === 'compact'
		? 'p-1 rounded-full hover:border-2 hover:border-primary'
		: 'flex items-center gap-3 px-3 py-2 border border-border rounded-lg hover:bg-accent hover:border-muted-foreground data-[state=open]:bg-accent data-[state=open]:border-muted-foreground'} bg-transparent cursor-pointer transition-all text-foreground {className}"
>
	{#if ndk.$currentPubkey}
		<User.Root {ndk} pubkey={ndk.$currentPubkey}>
			<User.Avatar class="w-8 h-8 flex-shrink-0" />
			{#if variant === 'full'}
				<div class="flex-1 text-left min-w-0">
					<User.Name class="text-sm font-medium text-foreground whitespace-nowrap overflow-hidden text-ellipsis" />
					<User.Npub class="text-xs text-muted-foreground font-mono" transform={truncateNpub} />
				</div>
				<svg
					class="w-4 h-4 text-muted-foreground transition-transform flex-shrink-0 [[data-state=open]_&]:rotate-180"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
				</svg>
			{/if}
		</User.Root>
	{:else}
		<div class="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
			<svg class="w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
			</svg>
		</div>
		{#if variant === 'full'}
			<div class="flex-1 text-left min-w-0">
				<div class="text-sm font-medium text-foreground">Login</div>
			</div>
			<svg
				class="w-4 h-4 text-muted-foreground transition-transform flex-shrink-0 [[data-state=open]_&]:rotate-180"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
			</svg>
		{/if}
	{/if}
</DropdownMenu.Trigger>
