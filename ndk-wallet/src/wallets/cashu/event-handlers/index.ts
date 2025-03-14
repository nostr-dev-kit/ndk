import { NDKEvent, NDKEventId, NDKRelay, NDKSubscription, NostrEvent } from "@nostr-dev-kit/ndk";

import { NDKKind } from "@nostr-dev-kit/ndk";
import { NDKCashuWallet } from "../wallet";
import { handleToken } from "./token";
import { handleEventDeletion } from "./deletion";
import { handleQuote } from "./quote";

const handlers: Record<number, (this: NDKCashuWallet, event: NDKEvent) => Promise<void>> = {
    [NDKKind.CashuToken]: handleToken,
    [NDKKind.CashuQuote]: handleQuote,
    [NDKKind.EventDeletion]: handleEventDeletion,
};

let balanceUpdateTimer: NodeJS.Timeout | null = null;

export async function eventHandler(
    this: NDKCashuWallet,
    event: NDKEvent,
) {
    const handler = handlers[event.kind!];
    if (handler) {
        if (balanceUpdateTimer) clearTimeout(balanceUpdateTimer);
        await handler.call(this, event);
        balanceUpdateTimer = setTimeout(() => {
            this.emit("balance_updated");
        }, 100);
    }
}

export async function eventDupHandler(
    this: NDKCashuWallet,
    event: NDKEvent | NostrEvent,
    relay: NDKRelay | undefined,
    timeSinceFirstSeen: number,
    sub: NDKSubscription,
    fromCache: boolean
) {
    // console.log("[EVENT DUPLICATE]", event.kind, relay?.url, { fromCache });
}
