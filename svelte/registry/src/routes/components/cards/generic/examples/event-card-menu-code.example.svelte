<script lang="ts">
	import type { NDKEvent } from '@nostr-dev-kit/ndk';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import { EventCard } from '$lib/registry/components/event-card';

	interface Props {
		ndk: NDKSvelte;
		event: NDKEvent;
		showRelayInfo?: boolean;
	}

	let { ndk, event, showRelayInfo = true }: Props = $props();

	let showMenu = $state(false);
	let showRawEventModal = $state(false);

	const isMuted = $derived.by(() => {
		if (!event.author) return false;
		return ndk.$mutes?.has(event.author.pubkey) ?? false;
	});

	async function toggleMute() {
		if (!ndk.$currentUser?.pubkey || !event.author) return;
		await ndk.$mutes?.toggle(event.author.pubkey);
		showMenu = false;
	}

	async function copyToClipboard(text: string) {
		await navigator.clipboard.writeText(text);
		showMenu = false;
	}
</script>

<div class="relative">
	<button
		onclick={() => (showMenu = !showMenu)}
		class="p-1 rounded-full hover:bg-muted"
		type="button"
	>
		<!-- Three dots icon -->
		<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
			<path
				d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
			/>
		</svg>
	</button>

	{#if showMenu}
		<div class="absolute right-0 mt-1 w-72 bg-popover border rounded-lg shadow-lg z-10">
			<button onclick={toggleMute} class="w-full px-3 py-3 text-left hover:bg-muted" type="button">
				{isMuted ? 'Unmute' : 'Mute'}
			</button>

			<button
				onclick={() => copyToClipboard(event.author?.nprofile ?? '')}
				class="w-full px-3 py-3 text-left hover:bg-muted"
				type="button"
			>
				Copy author (nprofile)
			</button>

			<button
				onclick={() => copyToClipboard(event.encode())}
				class="w-full px-3 py-3 text-left hover:bg-muted"
				type="button"
			>
				Copy ID (nevent)
			</button>

			<button
				onclick={() => {
					showMenu = false;
					showRawEventModal = true;
				}}
				class="w-full px-3 py-3 text-left hover:bg-muted"
				type="button"
			>
				View raw event
			</button>

			{#if showRelayInfo && event.relay?.url}
				<div class="border-t px-4 py-2 text-xs text-muted-foreground">
					{event.relay.url}
				</div>
			{/if}
		</div>
	{/if}
</div>

{#if showRawEventModal}
	<div class="fixed inset-0 z-50 flex items-center justify-center">
		<div class="absolute inset-0 bg-black/50" onclick={() => (showRawEventModal = false)} />

		<div class="relative bg-background border rounded-lg w-[90%] max-w-4xl max-h-[80vh] overflow-auto">
			<div class="flex justify-between px-6 py-4 border-b">
				<h3 class="text-lg font-semibold">Raw Event</h3>
				<button onclick={() => (showRawEventModal = false)} class="p-2 hover:bg-muted rounded">
					×
				</button>
			</div>

			<div class="px-6 py-4 bg-muted">
				<pre class="font-mono text-sm">{event.rawEvent()}</pre>
			</div>

			<div class="flex justify-end gap-2 px-6 py-4 border-t">
				<button
					onclick={() => copyToClipboard(JSON.stringify(event.rawEvent(), null, 2))}
					class="px-4 py-2 border rounded hover:bg-muted"
				>
					Copy to Clipboard
				</button>
				<button
					onclick={() => (showRawEventModal = false)}
					class="px-4 py-2 bg-primary text-primary-foreground rounded"
				>
					Close
				</button>
			</div>
		</div>
	</div>
{/if}
