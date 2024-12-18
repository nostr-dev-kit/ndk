import { NDKEvent } from "@nostr-dev-kit/ndk";

import { NDKKind } from "@nostr-dev-kit/ndk";
import { NDKCashuWallet } from "../wallet";
import handleToken from "./token";
import handleEventDeletion from "./deletion";
import { handleQuote } from "./quote";

export async function eventHandler(this: NDKCashuWallet, event: NDKEvent) {
    switch (event.kind) {
        case NDKKind.CashuToken:
            handleToken.bind(this, event).call(this);
            break;
        case NDKKind.CashuQuote:
            handleQuote.bind(this, event).call(this);
            break;
        case NDKKind.EventDeletion:
            handleEventDeletion.bind(this, event).call(this);
            break;
    }
}

