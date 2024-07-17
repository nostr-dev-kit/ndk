import NDK, { NDKCashuMintList, getRelayListForUser, NDKKind, NDKRelay, NDKRelaySet, NDKUser } from "@nostr-dev-kit/ndk";
import {NDKCashuWallet} from "../cashu/wallet.js";

class NDKWallet {
    private ndk: NDK;

    constructor(ndk: NDK) {
        this.ndk = ndk;
    }

    public createCashuWallet() {
        return new NDKCashuWallet(this.ndk);
    }

    public async fetchAllTokens() {
        
    }

    public async fetchUserWallets(user?: NDKUser) {
        user ??= this.ndk.activeUser;
        if (!user) throw new Error("No user provided or active user set.");

        // Fetch mint list for the user
        const _event = await this.ndk.fetchEvent({
            kinds: [NDKKind.CashuMintList],
            authors: [user.pubkey],
        });
        let relaySet: NDKRelaySet | undefined;
        let listEvent: NDKCashuMintList | undefined;
        if (_event) {
            listEvent = NDKCashuMintList.from(_event);
            relaySet = listEvent.relaySet;
        }

        const relayList = await getRelayListForUser(user.pubkey, this.ndk);
        if (relayList && relayList.writeRelayUrls.length > 0) {
            if (!relaySet) relaySet = new NDKRelaySet(new Set(), this.ndk);
            
            for (const url of relayList.writeRelayUrls) {
                const relay = this.ndk.pool.getRelay(url, true, true);
                relaySet.addRelay(relay);
            }
        }

        // fetch all wallets from the discovered relay set
        const wallets: NDKCashuWallet[] = [];
        const walletEvents = await this.ndk.fetchEvents(
            { kinds: [NDKKind.CashuWallet], authors: [user.pubkey]}, {
                groupable: false,
            }, relaySet
        )

        for (const event of walletEvents) {
            const wallet = await NDKCashuWallet.from(event);
            wallets.push(wallet);
        }

        // if we have a pubkey in the list, check which wallet has the corresponding pubkey and set that one as the first one
        if (listEvent?.p2pkPubkey) {
            console.log('reordering wallets based on pubkey', listEvent.p2pkPubkey);
            for (const wallet of wallets) {
                const p2pkPubkey = await wallet.getP2pk();
                console.log('checking wallet', p2pkPubkey, listEvent.p2pkPubkey);
                if (p2pkPubkey === listEvent.p2pkPubkey) {
                    console.log('found wallet', wallet.dTag);
                    wallets.splice(wallets.indexOf(wallet), 1);
                    wallets.unshift(wallet);
                    break;
                }
            }
        }

        return wallets;
    }
}

export default NDKWallet;