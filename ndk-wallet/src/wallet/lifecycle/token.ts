import type { NDKEvent, NDKRelay } from "@nostr-dev-kit/ndk";
import { NDKCashuToken } from "../../cashu/token";
import type NDKWalletLifecycle from ".";
import type { NDKCashuWallet } from "../../cashu/wallet";

async function handleToken(this: NDKWalletLifecycle, event: NDKEvent, relay?: NDKRelay) {
    this.debug("Received token event %s from %s", event.id, relay?.url);

    if (this.knownTokens.has(event.id)) return;
    this.knownTokens.add(event.id);

    const token = await NDKCashuToken.from(event);
    if (!token) return;

    const walletId = token.walletId;
    let wallet: NDKCashuWallet | undefined;
    if (walletId) wallet = this.wallets.get(walletId);
    wallet ??= this.defaultWallet;

    if (!wallet) {
        this.debug("no wallet found for token %s", token.id);
        this.orphanedTokens.set(token.id, token);
    } else {
        wallet.addToken(token);
    }
}

export default handleToken;
