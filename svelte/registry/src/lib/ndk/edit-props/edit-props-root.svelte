<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { NDKArticle, NDKEvent, NDKUser } from '@nostr-dev-kit/ndk';
	import { setEditPropsContext, type EditPropsContext, type PropDefinition } from './edit-props-context.svelte';
	import EditPropsDialog from './edit-props-dialog.svelte';

	let { children }: { children: Snippet } = $props();

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

<div class="edit-props">
	<button class="edit-props-button" onclick={toggleDialog}>
		<svg class="edit-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
			/>
		</svg>
		Edit Example Props
	</button>

	{@render children()}

	<EditPropsDialog bind:show={open} {props} onClose={() => (open = false)} onApply={updatePropValue} />
</div>

<style>
	.edit-props {
		margin-bottom: 1.5rem;
	}

	.edit-props-button {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background: hsl(var(--color-secondary));
		color: hsl(var(--color-secondary-foreground));
		border: 1px solid hsl(var(--color-border));
		border-radius: 0.375rem;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
	}

	.edit-props-button:hover {
		background: hsl(var(--color-secondary) / 0.8);
	}

	.edit-icon {
		width: 1rem;
		height: 1rem;
	}
</style>
