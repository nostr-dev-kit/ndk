import type { NDKEvent, NDKRelay } from "@nostr-dev-kit/ndk";
import { NDKCashuToken } from "../token";
import { NDKCashuWallet } from "../wallet";

async function handleToken(this: NDKCashuWallet, event: NDKEvent) {
    if (this.knownTokens.has(event.id)) return;

    const token = await NDKCashuToken.from(event);
    if (!token) return;

    this.addToken(token);
}

export default handleToken;
