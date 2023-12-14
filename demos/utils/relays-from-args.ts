import { NDKRelay } from "@nostr-dev-kit/ndk";

const defaultRelays = [ "wss://nos.lol" ];

export function relaysFromArgs(): NDKRelay[] {
    const explicitRelayUrls: string[] = [];
    const trustedRelayUrls: string[] = [];
    const relays: NDKRelay[] = [];

    // go through the command line arguments and load all URLs that start with ws:// or wss:// in the explicitRelayUrls array
    for (let i = 2; i < process.argv.length; i++) {
        const arg = process.argv[i];

        if (arg === "--trusted" && i + 1 < process.argv.length) {
            const nextArg = process.argv[i + 1];
            if (nextArg.startsWith("ws://") || nextArg.startsWith("wss://")) {
                trustedRelayUrls.push(nextArg);
                i++; // Skip the next iteration as it is already processed
                continue;
            }
        }

        if (arg.startsWith("ws://") || arg.startsWith("wss://")) {
            explicitRelayUrls.push(arg);
        }
    }

    // if there are no explicit relay URLs, use the default ones
    if (explicitRelayUrls.length === 0) {
        explicitRelayUrls.push(...defaultRelays);
    }

    for (const url of explicitRelayUrls) {
        const relay = new NDKRelay(url);
        relays.push(relay);
    }

    for (const url of trustedRelayUrls) {
        const relay = new NDKRelay(url);
        relay.trusted = true;
        relays.push(relay);
    }

    return relays;
}