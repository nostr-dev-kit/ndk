<script lang="ts">
	import { untrack } from 'svelte';
	import type { NDKArticle, NDKEvent, NDKUser } from '@nostr-dev-kit/ndk';
	import { createFetchEvent, createFetchUser } from '@nostr-dev-kit/svelte';
	import { getEditPropsContext, type PropType } from './edit-props-context.svelte';
	import { ndk } from '$site/ndk.svelte';

	interface Props {
		name: string;
		type: PropType;
		default?: string | number | boolean;
		value?: NDKUser | NDKEvent | NDKArticle | string | number | boolean;
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

	// Create reactive fetchers based on type
	const eventFetcher = $derived.by(() => {
		if (type !== 'event' || !defaultValue) return null;
		return createFetchEvent(ndk, () => ({ bech32: String(defaultValue), opts: { wrap: true } }));
	});

	const userFetcher = $derived.by(() => {
		if (type !== 'user' || !defaultValue) return null;
		return createFetchUser(ndk, () => String(defaultValue));
	});

	// Wire up fetched values when they become available
	$effect(() => {
		if (!value) {
			if (type === 'event' && eventFetcher && !eventFetcher.loading && eventFetcher.event) {
				value = eventFetcher.event;
				context.updatePropValue(name, eventFetcher.event);
			} else if (type === 'user' && userFetcher && userFetcher.$loaded) {
				value = userFetcher;
				context.updatePropValue(name, userFetcher);
			}
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
