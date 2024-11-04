import type { NDKEvent, NDKRelay } from "@nostr-dev-kit/ndk";
import { NDKCashuToken } from "../../cashu/token";
import type NDKWalletLifecycle from ".";
import type { NDKCashuWallet } from "../../cashu/wallet";

async function handleToken(this: NDKWalletLifecycle, event: NDKEvent, relay?: NDKRelay) {
    if (this.knownTokens.has(event.id)) return;
    this.knownTokens.add(event.id);

    const token = await NDKCashuToken.from(event);
    if (!token) return;

    const walletId = token.walletId;
    let wallet: NDKCashuWallet | undefined;
    if (walletId) wallet = this.wallets.get(walletId);
    wallet ??= this.defaultWallet;

    if (!wallet) {
        this.orphanedTokens.set(token.id, token);
    } else {
        wallet.addToken(token);
    }
}

export default handleToken;
