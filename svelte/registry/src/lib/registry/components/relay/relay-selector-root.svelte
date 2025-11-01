<!-- @ndk-version: relay-selector-root@0.1.0 -->
<!--
  @component Relay.Selector.Root
  Root context provider for relay selector primitives

  @example
  ```svelte
  <Relay.Selector.Root {ndk} bind:selected={selectedRelays} multiple={true}>
    <Relay.Selector.List />
    <Relay.Selector.AddForm />
  </Relay.Selector.Root>
  ```
-->
<script lang="ts">
	import { setContext } from 'svelte';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import { getNDKFromContext } from '../ndk-context.svelte.js';
	import { RELAY_SELECTOR_CONTEXT_KEY, type RelaySelectorContext } from './relay-selector-context.svelte.js';
	import type { Snippet } from 'svelte';

	interface Props {
		/** NDK instance (optional, falls back to context) */
		ndk?: NDKSvelte;

		/** Selected relay URLs (two-way binding) */
		selected?: string[];

		/** Allow multiple selection */
		multiple?: boolean;

		/** Additional CSS classes */
		class?: string;

		/** Child components */
		children: Snippet;
	}

	let {
		ndk: providedNdk,
		selected = $bindable([]),
		multiple = true,
		class: className = '',
		children
	}: Props = $props();

	const ndk = getNDKFromContext(providedNdk);

	// Get connected relays from NDK pool
	const connectedRelays = $derived.by(() => {
		const relays = Array.from(ndk.$pool?.relays?.keys() || []);
		return relays.filter(url => url.startsWith('ws'));
	});

	// Toggle relay selection
	function toggleRelay(relayUrl: string) {
		if (multiple) {
			if (selected.includes(relayUrl)) {
				selected = selected.filter(url => url !== relayUrl);
			} else {
				selected = [...selected, relayUrl];
			}
		} else {
			selected = [relayUrl];
		}
	}

	// Add a new relay to selection
	function addRelay(
		relayUrl: string,
		options: { autoSelect?: boolean } = {}
	) {
		const { autoSelect = true } = options;

		// Add to selection if requested
		if (autoSelect && !selected.includes(relayUrl)) {
			if (multiple) {
				selected = [...selected, relayUrl];
			} else {
				selected = [relayUrl];
			}
		}
	}

	// Remove relay from selection
	function removeRelay(relayUrl: string) {
		selected = selected.filter(url => url !== relayUrl);
	}

	// Check if relay is selected
	function isSelected(relayUrl: string): boolean {
		return selected.includes(relayUrl);
	}

	// Clear selection
	function clearSelection() {
		selected = [];
	}

	// Create reactive context
	const context: RelaySelectorContext = {
		get ndk() {
			return ndk;
		},
		get selected() {
			return selected;
		},
		get multiple() {
			return multiple;
		},
		get connectedRelays() {
			return connectedRelays;
		},
		toggleRelay,
		addRelay,
		removeRelay,
		isSelected,
		clearSelection
	};

	setContext(RELAY_SELECTOR_CONTEXT_KEY, context);
</script>

<div class="relay-selector-root {className}">
	{@render children()}
</div>

<style>
	.relay-selector-root {
		display: contents;
	}
</style>
