import type { NDKSvelte } from '@nostr-dev-kit/svelte';

/**
 * Context shared between Relay Selector components
 */
export interface RelaySelectorContext {
	/** NDK instance */
	ndk: NDKSvelte;

	/** Selected relay URLs */
	selected: string[];

	/** Whether multiple selection is allowed */
	multiple: boolean;

	/** Connected relays from NDK pool */
	connectedRelays: string[];

	/** Toggle relay selection */
	toggleRelay: (relayUrl: string) => void;

	/** Add a new relay to selection */
	addRelay: (relayUrl: string, options?: { autoSelect?: boolean }) => void;

	/** Remove relay from selection */
	removeRelay: (relayUrl: string) => void;

	/** Check if relay is selected */
	isSelected: (relayUrl: string) => boolean;

	/** Clear all selections */
	clearSelection: () => void;
}

export const RELAY_SELECTOR_CONTEXT_KEY = Symbol('relay-selector');
