import { NDKEvent } from "@nostr-dev-kit/ndk";
import { NDKCashuToken } from "../../cashu/token";
import NDKWalletLifecycle from ".";
import { NDKCashuWallet } from "../../cashu/wallet";

async function handleToken(
    this: NDKWalletLifecycle,
    event: NDKEvent
) {
    if (this.knownTokens.has(event.id)) return;
    this.knownTokens.add(event.id);
    
    const token = await NDKCashuToken.from(event);
    
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