import type { NDKRelay } from "@nostr-dev-kit/ndk";

export function formatRelayName(relay: NDKRelay): string {
    let name = relay.url;

    // Some well known relays
    switch (relay.url) {
        case "wss://purplepag.es":
            return "Purple Pages";
        case "wss://relay.damus.io":
            return "Damus relay";
        case "wss://relay.snort.social":
            return "Snort relay";
    }

    // strip protocol prefix
    name = name.replace(/^(ws|wss):\/\//, "");

    return name;
}
