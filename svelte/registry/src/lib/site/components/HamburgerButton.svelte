<script lang="ts">
	import { sidebar } from '$lib/site/stores/sidebar.svelte';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { Menu01Icon, Cancel01Icon } from '@hugeicons/core-free-icons';
</script>

<button
	onclick={() => sidebar.toggleOpen()}
	class="fixed top-4 left-4 z-[1000] hidden md:flex w-10 h-10 items-center justify-center rounded-lg bg-background border border-border text-foreground cursor-pointer transition-all duration-150 hover:bg-muted active:scale-95"
	aria-label={sidebar.open ? 'Close sidebar' : 'Open sidebar'}
>
	{#if sidebar.open}
		<HugeiconsIcon icon={Cancel01Icon} size={24} strokeWidth={2} />
	{:else}
		<HugeiconsIcon icon={Menu01Icon} size={24} strokeWidth={2} />
	{/if}
</button>
