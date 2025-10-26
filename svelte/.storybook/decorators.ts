import type { Decorator } from '@storybook/svelte';
import { createNDK } from '../src/lib/ndk-svelte.svelte';

// Create a shared NDK instance for all stories
export const ndk = createNDK({
  explicitRelayUrls: [
    'wss://relay.primal.net',
    'wss://relay.nostr.band',
    'wss://relay.damus.io',
    'wss://nos.lol',
    'wss://relay.snort.social'
  ],
  autoConnectUserRelays: false,
  // No authentication - read-only mode for stories
});

// Connect NDK on initialization
ndk.connect();

// NDK decorator - provides the NDK instance to all stories
export const withNDK: Decorator = (story, context) => {
  // Pass NDK through context
  context.args.ndk = ndk;

  return story();
};