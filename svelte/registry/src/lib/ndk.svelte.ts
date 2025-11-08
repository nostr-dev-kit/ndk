import { createNDK } from '@nostr-dev-kit/svelte';
import NDKCacheAdapterSqliteWasm from '@nostr-dev-kit/cache-sqlite-wasm';
import { LocalStorage } from '@nostr-dev-kit/sessions';
import { NDKInterestList, NDKRelayFeedList } from '@nostr-dev-kit/ndk';

import "$lib/registry/components/generic-card";

const cacheAdapter = new NDKCacheAdapterSqliteWasm({
  dbName: 'ndk-registry',
  workerUrl: '/worker.js',
  wasmUrl: '/sql-wasm.wasm'
});

export const ndk = createNDK({
  explicitRelayUrls: [
    'wss://relay.damus.io',
    'wss://relay.nostr.band',
    'wss://nos.lol'
  ],
  cacheAdapter,
  session: {
    autoSave: true,
    storage: new LocalStorage(),
    fetches: {
      follows: true,
      mutes: true,
      wallet: false,
      monitor: [
        NDKInterestList,
        NDKRelayFeedList
      ]
    }
  }
});

export async function initializeNDK() {
  try {
    await cacheAdapter.initializeAsync()
    ndk.connect()
  } catch (err) {
    console.error('NDK initialization error:', err);
  }
}
