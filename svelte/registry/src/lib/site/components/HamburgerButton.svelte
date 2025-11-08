<script lang="ts">
	import { sidebar } from '$lib/site/stores/sidebar.svelte';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { Menu01Icon, Cancel01Icon } from '@hugeicons/core-free-icons';
</script>

<button
	onclick={() => sidebar.toggleOpen()}
	class="hamburger-button"
	aria-label={sidebar.open ? 'Close sidebar' : 'Open sidebar'}
>
	{#if sidebar.open}
		<HugeiconsIcon icon={Cancel01Icon} size={24} strokeWidth={2} />
	{:else}
		<HugeiconsIcon icon={Menu01Icon} size={24} strokeWidth={2} />
	{/if}
</button>

<style>
	.hamburger-button {
		position: fixed;
		top: 1rem;
		left: 1rem;
		z-index: 1000;
		display: none;
		width: 2.5rem;
		height: 2.5rem;
		align-items: center;
		justify-content: center;
		border-radius: 0.5rem;
		background-color: hsl(var(--background));
		border: 1px solid hsl(var(--border));
		color: hsl(var(--foreground));
		cursor: pointer;
		transition: all 150ms ease;
	}

	.hamburger-button:hover {
		background-color: hsl(var(--muted));
	}

	.hamburger-button:active {
		transform: scale(0.95);
	}

	@media (max-width: 768px) {
		.hamburger-button {
			display: flex;
		}
	}
</style>
