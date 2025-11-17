<script lang="ts">
	import { untrack, getContext } from 'svelte';
	import type { NDKArticle, NDKEvent, NDKUser } from '@nostr-dev-kit/ndk';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import { getEditPropsContext, type PropType } from './edit-props-context.svelte';
	import { fetchFromIdentifier } from './edit-props-fetcher';
    import { ndk } from '$site/ndk.svelte';

	interface Props {
		name: string;
		type: PropType;
		default?: string | number | boolean;
		value?: NDKUser | NDKEvent | NDKArticle | string | number | boolean;
		options?: (NDKUser | NDKEvent | NDKArticle)[];
	}

	let { name, type, default: defaultValue, value = $bindable(), options }: Props = $props();

	let context = getEditPropsContext();

	// Register this prop with the parent context
	untrack(() => {
		context.registerProp({
			name,
			type,
			default: defaultValue,
			value,
			options
		});
	});

	// Fetch default value on mount if no value is provided
	$effect(() => {
		if (!value && defaultValue && (type === 'user' || type === 'event' || type === 'article')) {
			untrack(async () => {
				const result = await fetchFromIdentifier(ndk, type, String(defaultValue));
				if (result.success && result.value) {
					value = result.value;
					context.updatePropValue(name, result.value);
				}
			});
		}
	});

	// Watch for value changes from the context and update the bindable
	$effect(() => {
		const prop = context.props.find(p => p.name === name);
		if (prop && prop.value !== undefined) {
			untrack(() => {
				value = prop.value;
			});
		}
	});
</script>

<!-- This component is invisible, it just registers configuration -->
