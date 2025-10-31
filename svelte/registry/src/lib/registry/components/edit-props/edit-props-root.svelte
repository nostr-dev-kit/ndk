<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { NDKArticle, NDKEvent, NDKUser } from '@nostr-dev-kit/ndk';
	import { setEditPropsContext, type EditPropsContext, type PropDefinition } from './edit-props-context.svelte';
	import EditPropsDialog from './edit-props-dialog.svelte';

	let { children, buttonText = 'Edit Props' }: { children: Snippet; buttonText?: string } = $props();

	let props = $state<PropDefinition[]>([]);
	let open = $state(false);

	function registerProp(prop: PropDefinition) {
		// Check if prop already exists
		const existing = props.find(p => p.name === prop.name);
		if (!existing) {
			props = [...props, prop];
		}
	}

	function updatePropValue(name: string, value: NDKUser | NDKEvent | NDKArticle | string) {
		props = props.map(p => (p.name === name ? { ...p, value } : p));
	}

	function toggleDialog() {
		open = !open;
	}

	const context: EditPropsContext = {
		get props() {
			return props;
		},
		get open() {
			return open;
		},
		registerProp,
		updatePropValue,
		toggleDialog
	};

	setEditPropsContext(context);
</script>

<div class="edit-props-root">
	{@render children()}

	<button class="edit-props-button" onclick={toggleDialog}>
		{buttonText}
	</button>

	<EditPropsDialog bind:show={open} {props} onClose={() => (open = false)} onApply={updatePropValue} />
</div>

<style>
	.edit-props-root {
		display: none;
	}

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
