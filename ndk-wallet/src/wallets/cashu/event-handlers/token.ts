import type { NDKEvent } from "@nostr-dev-kit/ndk";
import { NDKCashuToken } from "../token";
import { NDKCashuWallet } from "../wallet";

export async function handleToken(this: NDKCashuWallet, event: NDKEvent) {
    if (this.state.knownTokens.has(event.id)) return;

    const token = await NDKCashuToken.from(event);
    if (!token) return;

    this.addToken(token);
}