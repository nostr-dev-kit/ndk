import type { NDKEvent } from "@nostr-dev-kit/ndk";
import { NDKCashuToken } from "@nostr-dev-kit/ndk";
import type { NDKCashuWallet } from "../wallet";

let _cumulativeTime = 0;
let _cumulativeCalls = 0;

export async function handleToken(this: NDKCashuWallet, event: NDKEvent) {
    if (this.state.tokens.has(event.id)) return;

    const startTime = Date.now();

    const token = await NDKCashuToken.from(event);
    if (!token) {
        _cumulativeTime += Date.now() - startTime;
        _cumulativeCalls++;
        return;
    }

    _cumulativeTime += Date.now() - startTime;
    _cumulativeCalls++;

    for (const deletedTokenId of token.deletedTokens) {
        this.state.removeTokenId(deletedTokenId);
    }

    this.state.addToken(token);
}

setInterval(() => {}, 5000);
