<script lang="ts">
	import { getContext } from 'svelte';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import { RelaySelectorPopover } from '$lib/registry/components/blocks';

	const ndk = getContext<NDKSvelte>('ndk');

	let selected = $state<string[]>([]);
</script>

<div class="w-full max-w-md">
	<RelaySelectorPopover {ndk} bind:selected>
		{#snippet trigger()}
			<button
				type="button"
				class="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					class="w-5 h-5"
				>
					<path d="M2.5 12C2.5 7.522 2.5 5.282 3.891 3.891C5.282 2.5 7.521 2.5 12 2.5C16.478 2.5 18.718 2.5 20.109 3.891C21.5 5.282 21.5 7.521 21.5 12C21.5 16.478 21.5 18.718 20.109 20.109C18.718 21.5 16.478 21.5 12 21.5C7.521 21.5 5.282 21.5 3.891 20.109C2.5 18.718 2.5 16.478 2.5 12Z" />
					<path d="M11 15.5H12C14.828 15.5 17 13.828 17 11.75C17 9.672 14.828 8 12 8H11C8.172 8 6 9.672 6 11.75C6 13.828 8.172 15.5 11 15.5Z" />
				</svg>
				<span>
					{#if selected.length === 0}
						Choose Relays
					{:else}
						{selected.length} {selected.length === 1 ? 'Relay' : 'Relays'}
					{/if}
				</span>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="w-4 h-4"
				>
					<path d="m6 9 6 6 6-6"/>
				</svg>
			</button>
		{/snippet}
	</RelaySelectorPopover>

	{#if selected.length > 0}
		<div class="mt-4 text-sm text-muted-foreground">
			Connected to {selected.length} {selected.length === 1 ? 'relay' : 'relays'}
		</div>
	{/if}
</div>

<style>
	:global(.dark) {
		--muted-foreground: 215deg 20.2% 65.1%;
	}

	:global(.light) {
		--muted-foreground: 215.4deg 16.3% 46.9%;
	}
</style>