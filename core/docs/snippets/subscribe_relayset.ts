import NDK, {NDKRelaySet} from "@nostr-dev-kit/ndk";

const ndk = new NDK();
const explicitRelaySet = NDKRelaySet.fromRelayUrls(["wss://explicit.relay"], ndk);
ndk.subscribe(
    {kinds: [7]}, // Filters
    {
        // Options object now includes relaySet
        closeOnEose: true,
        relaySet: explicitRelaySet,
    },
);
