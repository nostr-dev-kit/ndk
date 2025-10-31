<script lang="ts">
	import { getEditPropsContext } from './edit-props-context.svelte';

	let { children, class: className = '' }: { children: any; class?: string } = $props();

	const context = getEditPropsContext();
</script>

<button class="edit-props-button {className}" onclick={context.toggleDialog}>
	{@render children()}
</button>

<style>
	.edit-props-button {
		display: inline-flex;
		align-items: center;
		padding: 0.5rem 1rem;
		background: var(--color-primary);
		color: white;
		border: none;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.15s;
		white-space: nowrap;
	}

	.edit-props-button:hover {
		opacity: 0.9;
		transform: translateY(-1px);
	}

	.edit-props-button:active {
		transform: translateY(0);
	}
</style>
