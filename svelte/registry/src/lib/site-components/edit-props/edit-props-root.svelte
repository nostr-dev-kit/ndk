<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { NDKArticle, NDKEvent, NDKUser } from '@nostr-dev-kit/ndk';
	import { setEditPropsContext, type EditPropsContext, type PropDefinition } from './edit-props-context.svelte';
	import EditPropsDialog from './edit-props-dialog.svelte';

	let { children }: { children: Snippet } = $props();

	let propDefinitions = $state<PropDefinition[]>([]);
	let open = $state(false);

	function registerProp(prop: PropDefinition) {
		// Check if prop already exists
		const existing = propDefinitions.find(p => p.name === prop.name);
		if (!existing) {
			propDefinitions = [...propDefinitions, prop];
		}
	}

	function updatePropValue(name: string, value: NDKUser | NDKEvent | NDKArticle | string) {
		propDefinitions = propDefinitions.map(p => (p.name === name ? { ...p, value } : p));
	}

	function toggleDialog() {
		open = !open;
	}

	const context: EditPropsContext = {
		get props() {
			return propDefinitions;
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

<!-- Hidden props container -->
<div>
	{@render children()}
</div>

<EditPropsDialog bind:show={open} props={propDefinitions} onClose={() => (open = false)} onApply={updatePropValue} />
