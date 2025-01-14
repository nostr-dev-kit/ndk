import { NDKEvent } from "@nostr-dev-kit/ndk";

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

export async function eventHandler(this: NDKCashuWallet, event: NDKEvent) {
    const handler = handlers[event.kind!];
    if (handler) {
        await handler.call(this, event);
    }
}

