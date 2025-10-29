<script lang="ts">
	import { untrack } from 'svelte';
	import type { NDKArticle, NDKEvent, NDKUser } from '@nostr-dev-kit/ndk';
	import { getEditPropsContext, type PropType } from './edit-props-context.svelte';

	interface Props {
		name: string;
		type: PropType;
		default?: string;
		value?: NDKUser | NDKEvent | NDKArticle | string;
	}

	let { name, type, default: defaultValue, value = $bindable() }: Props = $props();

	let context = getEditPropsContext();

	// Register this prop with the parent context
	untrack(() => {
		context.registerProp({
			name,
			type,
			default: defaultValue,
			value
		});
	});

	// Watch for value changes from the context and update the bindable
	$effect(() => {
		const prop = context.props.find(p => p.name === name);
		if (prop && prop.value !== undefined) {
			value = prop.value;
		}
	});
</script>

<!-- This component is invisible, it just registers configuration -->
