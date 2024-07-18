import { NDKEvent } from "@nostr-dev-kit/ndk";
import NDKWalletLifecycle from ".";
import { NDKCashuWallet } from "../../cashu/wallet";

function removeDeletedWallet(this: NDKWalletLifecycle, walletId: string) {
    this.wallets.delete(walletId);
    if (this.defaultWallet?.walletId === walletId) this.setDefaultWallet(undefined);
    this.emit("wallets");
}

async function handleWalletEvent(
    this: NDKWalletLifecycle,
    event: NDKEvent,
) {
    const wallet = await NDKCashuWallet.from(event);

    if (!wallet) {
        this.debug("wallet deleted", event.dTag);
        removeDeletedWallet.bind(this, event.dTag!);
        return;
    } else {
        this.debug("wallet event", wallet.walletId);
    }

    wallet.on("balance", () => {
        this.debug("wallet balance update", wallet.walletId);
        this.emit("wallet:balance", wallet)
    });
    const existingEvent = this.wallets.get(wallet.walletId);
    if (existingEvent && existingEvent.created_at! >= wallet.created_at!) return;

    this.wallets.set(wallet.walletId, wallet);
    this.emit("wallet", wallet);
    if (this._mintList && wallet.p2pkPubkey === this._mintList.p2pkPubkey) this.setDefaultWallet(this._mintList.p2pkPubkey);
}

export default handleWalletEvent;