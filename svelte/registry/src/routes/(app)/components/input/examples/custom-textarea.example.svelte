<script lang="ts">
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import UserSearchCombobox from '$lib/registry/components/user/inputs/search/user-search-combobox.svelte';

	interface Props {
		ndk: NDKSvelte;
	}

	let { ndk }: Props = $props();
</script>

<div class="max-w-md w-full">
	<UserSearchCombobox {ndk}>
		{#snippet input({ value, oninput, loading })}
			<textarea
				{value}
				{oninput}
				placeholder="Type to search users..."
				class="flex min-h-[80px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
			></textarea>
		{/snippet}
	</UserSearchCombobox>
</div>
