import {
    type NDKEvent,
    NDKEventId,
    NDKKind,
    type NDKRelay,
    type NDKSubscription,
    type NostrEvent,
} from "@nostr-dev-kit/ndk";
import type { NDKCashuWallet } from "../wallet";
import { handleEventDeletion } from "./deletion";
import { handleQuote } from "./quote";
import { handleToken } from "./token";

const handlers: Record<number, (this: NDKCashuWallet, event: NDKEvent) => Promise<void>> = {
    [NDKKind.CashuToken]: handleToken,
    [NDKKind.CashuQuote]: handleQuote,
    [NDKKind.EventDeletion]: handleEventDeletion,
};

let balanceUpdateTimer: NodeJS.Timeout | null = null;

export async function eventHandler(this: NDKCashuWallet, event: NDKEvent) {
    const handler = handlers[event.kind];
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
    _event: NDKEvent | NostrEvent,
    _relay: NDKRelay | undefined,
    _timeSinceFirstSeen: number,
    _sub: NDKSubscription,
    _fromCache: boolean,
) {
    // console.log("[EVENT DUPLICATE]", event.kind, relay?.url, { fromCache });
}
