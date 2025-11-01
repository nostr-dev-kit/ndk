<script lang="ts">
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import { Relay } from '$lib/registry/components/relay';

	interface Props {
		ndk?: NDKSvelte;
		selected?: string[];
		multiple?: boolean;
		label?: string;
		helperText?: string;
		showSelectedChips?: boolean;
	}

	let {
		ndk,
		selected = $bindable([]),
		multiple = true,
		label,
		helperText,
		showSelectedChips = false
	}: Props = $props();
</script>

<Relay.Selector.Root {ndk} bind:selected {multiple}>
	<div class="space-y-4">
		{#if label}
			<label class="text-sm font-medium">
				{label}
			</label>
		{/if}

		{#if showSelectedChips && selected.length > 0}
			<div class="flex flex-wrap gap-2">
				{#each selected as relayUrl}
					<div
						class="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-muted text-muted-foreground"
					>
						<span class="truncate max-w-[200px]">{relayUrl}</span>
						<button
							type="button"
							onclick={() => {
								selected = selected.filter((url) => url !== relayUrl);
							}}
							class="hover:text-foreground"
						>
							×
						</button>
					</div>
				{/each}
			</div>
		{/if}

		<div class="border rounded-md p-4">
			<Relay.Selector.List />
		</div>

		<Relay.Selector.AddForm />

		{#if helperText}
			<p class="text-sm text-muted-foreground">
				{helperText}
			</p>
		{/if}
	</div>
</Relay.Selector.Root>
