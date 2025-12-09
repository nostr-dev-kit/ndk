import NDK, { NDKPool, NDKRelay } from "@nostr-dev-kit/ndk";

const ndk = new NDK();

const largeRelays = new NDKPool([`wss://relay.damus.io`, "wss://premium.primal.net"], ndk);
largeRelays.addRelay(new NDKRelay("wss://nos.lol", undefined, ndk));

largeRelays.connect();

ndk.pools.length; // 1

const nicheRelays = new NDKPool([`wss://relay.vertexlab.io`, "wss://purplepag.es/"], ndk);

nicheRelays.connect();

ndk.pools.length; // 2
