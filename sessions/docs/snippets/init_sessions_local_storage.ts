import NDK from "@nostr-dev-kit/ndk";
import { LocalStorage, NDKSessionManager } from "@nostr-dev-kit/sessions";

// Create a new NDK instance with explicit relays
const ndk = new NDK({
    explicitRelayUrls: ["wss://relay.damus.io", "wss://nos.lol", "wss://relay.nostr.band"],
});

const sessions = new NDKSessionManager(ndk, {
    storage: new LocalStorage(),
    autoSave: true, // Automatically save changes
    saveDebounceMs: 500, // Debounce auto-saves
});
