<script lang="ts">
	import { SessionSwitcher } from '$lib/registry/components/session/switchers/compound';
	import type { NDKSvelteWithSession } from '@nostr-dev-kit/svelte';
	import type { NDKSession } from '@nostr-dev-kit/sessions';

	interface Props {
		ndk: NDKSvelteWithSession;
		onaddsession?: () => void;
		actions?: Array<{
			label: string;
			icon?: import('svelte').Snippet;
			onclick: () => void;
			variant?: 'default' | 'primary' | 'danger';
		}>;
	}

	let { ndk, onaddsession, actions = [] }: Props = $props();
</script>

<SessionSwitcher.Root {ndk}>
	<SessionSwitcher.Trigger variant="compact" />
	<SessionSwitcher.Content>
		{#if ndk.$currentPubkey}
			<SessionSwitcher.Section label="Active Session">
				<SessionSwitcher.Item pubkey={ndk.$currentPubkey} active={true} />
			</SessionSwitcher.Section>
		{/if}

		{#if ndk.$sessions.all.length > 1}
			<SessionSwitcher.Separator />
			<SessionSwitcher.Section label="Other Sessions">
				{#each ndk.$sessions.all.filter(s => s.pubkey !== ndk.$currentPubkey) as session (session.pubkey)}
					<SessionSwitcher.Item pubkey={session.pubkey} />
				{/each}
			</SessionSwitcher.Section>
		{/if}

		{#if onaddsession || actions.length > 0}
			<SessionSwitcher.Separator />
			<SessionSwitcher.Section>
				{#if onaddsession}
					<SessionSwitcher.Action onclick={onaddsession} variant="primary">
						{#snippet icon()}
							<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
							</svg>
						{/snippet}
						Add Session
					</SessionSwitcher.Action>
				{/if}

				{#each actions as action (action.label)}
					<SessionSwitcher.Action onclick={action.onclick} variant={action.variant}>
						{#if action.icon}
							{#snippet icon()}
								{@render action.icon()}
							{/snippet}
						{/if}
						{action.label}
					</SessionSwitcher.Action>
				{/each}
			</SessionSwitcher.Section>
		{/if}
	</SessionSwitcher.Content>
</SessionSwitcher.Root>
