import NDK from "@nostr-dev-kit/ndk";
import { writable } from "svelte/store";

const _ndk = new NDK({
    explicitRelayUrls: [
        "wss://relay.f7z.io",
        "wss://nos.lol",
        "wss://relay.damus.io",
        "wss://relay.snort.social",
    ],
});

export default writable(_ndk);
