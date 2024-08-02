import type { NDKEvent, NDKRelay } from "@nostr-dev-kit/ndk";
import type NDKWalletLifecycle from ".";
import { NDKCashuWallet, NDKCashuWalletState } from "../../cashu/wallet";

function removeDeletedWallet(this: NDKWalletLifecycle, walletId: string) {
    this.wallets.delete(walletId);
    if (this.defaultWallet?.walletId === walletId) this.setDefaultWallet(undefined);
    this.emit("wallets");
}

const seenWallets: Record<string, { events: NDKEvent[]; mostRecentTime: number }> = {};

async function handleWalletEvent(this: NDKWalletLifecycle, event: NDKEvent, relay?: NDKRelay) {
    const wallet = await NDKCashuWallet.from(event);
    if (!wallet) {
        this.debug("encountered a deleted wallet from %s (%d)", relay?.url, event.created_at);
    }

    // check if we already have this dTag
    const dTag = event.dTag!;
    const existing = seenWallets[dTag];
    if (existing) {
        if (wallet) {
            this.debug("wallet with privkey %s (%s)", wallet.privkey, wallet.p2pk);
        }
        existing.events.push(event);

        if (existing.mostRecentTime < event.created_at!) {
            this.debug.extend(dTag)(
                "Relay %s sent a newer event %d vs %d (%d)",
                relay?.url,
                existing.mostRecentTime,
                event.created_at,
                event.created_at! - existing.mostRecentTime
            );
            existing.mostRecentTime = event.created_at!;
        } else if (existing.mostRecentTime > event.created_at!) {
            this.debug.extend(dTag)(
                "Relay %s sent an old event %d vs %d (%d)",
                relay?.url,
                existing.mostRecentTime,
                event.created_at,
                existing.mostRecentTime - event.created_at!
            );
            return;
        } else {
            return;
        }
    } else {
        this.debug.extend(dTag)("Relay %s sent a new wallet %s", relay?.url, dTag);
        seenWallets[dTag] = {
            events: [event],
            mostRecentTime: event.created_at!,
        };
    }

    // const wallet = await NDKCashuWallet.from(event);

    if (!wallet) {
        this.debug("wallet deleted", event.dTag);
        removeDeletedWallet.bind(this, event.dTag!);
        return;
    } else {
        if (wallet.balance) this.emit("wallet:balance", wallet);
    }

    let walletUpdateDebounce: NodeJS.Timeout | undefined;

    wallet.on("balance", () => {
        if (wallet.state !== NDKCashuWalletState.READY) return;

        this.emit("wallet:balance", wallet);

        if (walletUpdateDebounce) clearTimeout(walletUpdateDebounce);
        walletUpdateDebounce = setTimeout(() => {
            wallet.updateBalance();
        }, 5000);
    });
    const existingEvent = this.wallets.get(wallet.walletId);

    // always store the wallet by p2pk, even before checking for their created_at
    // that way, if a wallet had it's private key replaced, we can still spend from it
    const walletP2pk = await wallet.getP2pk();
    if (walletP2pk) {
        this.walletsByP2pk.set(walletP2pk, wallet);
    }

    // check if this is the most up to date version of this wallet we have
    if (existingEvent && existingEvent.created_at! >= wallet.created_at!) return;

    this.wallets.set(wallet.walletId, wallet);
    this.emit("wallet", wallet);
    if (this._mintList && wallet.p2pk === this._mintList.p2pk)
        this.setDefaultWallet(this._mintList.p2pk);
}

export default handleWalletEvent;
