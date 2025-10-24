import NDK, { NDKPool, NDKRelay } from "@nostr-dev-kit/ndk";

const ndk = new NDK();

const largeRelays = new NDKPool([`wss://relay.damus.io`, "wss://premium.primal.net"], ndk);
largeRelays.addRelay(new NDKRelay("wss://nos.lol", undefined, ndk));

const nicheRelays = new NDKPool([`wss://asad`, "wss://premisadasdum.primal.net"], ndk);

nicheRelays.connect();

ndk.pools.length; // 2
