import { NDKEvent } from "@nostr-dev-kit/ndk";
import NDKWalletLifecycle from ".";
import { NDKCashuWallet, NDKCashuWalletState } from "../../cashu/wallet";

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
        if (wallet.balance)
            this.emit("wallet:balance", wallet)
    }

    let walletUpdateDebounce: NodeJS.Timeout | undefined;

    wallet.on("balance", () => {
        if (wallet.state !== NDKCashuWalletState.READY) return

        this.emit("wallet:balance", wallet)

        if (walletUpdateDebounce) clearTimeout(walletUpdateDebounce);
        walletUpdateDebounce = setTimeout(() => {
            wallet.updateBalance();
        }, 5000);
    });
    const existingEvent = this.wallets.get(wallet.walletId);
    if (existingEvent && existingEvent.created_at! >= wallet.created_at!) return;

    const walletP2pk = await wallet.getP2pk();
    if (walletP2pk) {
        this.walletsByP2pk.set(walletP2pk, wallet);
    }

    this.wallets.set(wallet.walletId, wallet);
    this.emit("wallet", wallet);
    if (this._mintList && wallet.p2pkPubkey === this._mintList.p2pkPubkey) this.setDefaultWallet(this._mintList.p2pkPubkey);
}

export default handleWalletEvent;