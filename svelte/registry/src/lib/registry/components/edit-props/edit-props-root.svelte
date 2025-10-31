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

<!-- Hidden props container -->
<div class="hidden">
	{@render children()}
</div>

<EditPropsDialog bind:show={open} {props} onClose={() => (open = false)} onApply={updatePropValue} />
