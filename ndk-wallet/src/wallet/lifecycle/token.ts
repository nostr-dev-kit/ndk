import { NDKEvent } from "@nostr-dev-kit/ndk";
import { NDKCashuToken } from "../../cashu/token";
import NDKWalletLifecycle from ".";
import { NDKCashuWallet } from "../../cashu/wallet";

function handleToken(
    this: NDKWalletLifecycle,
    event: NDKEvent
) {
    if (this.knownTokens.has(event.id)) return;
    this.knownTokens.add(event.id);
    
    const token = NDKCashuToken.from(event);

    for (const proof of token.proofs) {
        if (proof.id === "9mlfd5vCzgG") {
            console.log("👉 FOUND PROOF 9mlfd5vCzgG", event.rawEvent(), event.onRelays, event.relay)
        }
    }
    
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