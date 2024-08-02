import type { NDKNutzap, NDKUser } from "@nostr-dev-kit/ndk";
import type NDK from "@nostr-dev-kit/ndk";
import { NDKCashuMintList } from "@nostr-dev-kit/ndk";
import { NDKCashuWallet } from "../cashu/wallet.js";
import { EventEmitter } from "tseep";
import createDebug from "debug";
import NDKWalletLifecycle from "./lifecycle/index.js";
import type { MintUrl } from "../cashu/mint/utils.js";
import type { NDKCashuToken } from "../cashu/token.js";

const d = createDebug("ndk-wallet:wallet");

class NDKWallet extends EventEmitter<{
    /**
     * New default was has been established
     * @param wallet
     */
    "wallet:default": (wallet: NDKCashuWallet) => void;
    mintlist: (mintList: NDKCashuMintList) => void;
    wallet: (wallet: NDKCashuWallet) => void;
    wallets: () => void;
    "wallet:balance": (wallet: NDKCashuWallet) => void;

    "nutzap:seen": (nutzap: NDKNutzap) => void;
    "nutzap:redeemed": (nutzap: NDKNutzap) => void;
    "nutzap:failed": (nutzap: NDKNutzap) => void;

    ready: () => void;
}> {
    public ndk: NDK;

    private lifecycle: NDKWalletLifecycle | undefined;

    constructor(ndk: NDK) {
        super();
        this.ndk = ndk;
    }

    get state() {
        return this.lifecycle?.state ?? "loading";
    }

    public createCashuWallet() {
        return new NDKCashuWallet(this.ndk);
    }

    /**
     * Starts monitoring changes for the user's wallets
     */
    public start(user?: NDKUser) {
        this.lifecycle = new NDKWalletLifecycle(this, this.ndk, user ?? this.ndk.activeUser!);
        this.lifecycle.start();
    }

    /**
     * Publishes the mint list tying to a specific wallet
     */
    async setMintList(wallet: NDKCashuWallet) {
        const mintList = new NDKCashuMintList(this.ndk);
        mintList.relays = wallet.relays;
        mintList.mints = wallet.mints;
        mintList.p2pk = await wallet.getP2pk();
        return mintList.publish();
    }

    /**
     * Get a list of the current wallets of this user.
     */
    get wallets(): NDKCashuWallet[] {
        if (!this.lifecycle) return [];
        return Array.from(this.lifecycle.wallets.values());
    }

    async transfer(wallet: NDKCashuWallet, fromMint: MintUrl, toMint: MintUrl) {
        const balanceInMint = wallet.mintBalance(fromMint);

        if (balanceInMint < 4) {
            throw new Error("insufficient balance in mint:" + fromMint);
        }

        const deposit = wallet.deposit(balanceInMint - 3, toMint);

        return new Promise<NDKCashuToken>(async (resolve, reject) => {
            d("starting deposit from %s to %s", fromMint, toMint);
            deposit.on("success", (token: NDKCashuToken) => {
                d("deposit success");
                this.emit("wallet:balance", wallet);
                resolve(token);
            });
            deposit.on("error", (error: string) => {
                d("deposit error: %s", error);
                reject(error);
            });

            // generate pr
            const pr = await deposit.start();
            d("deposit pr: %s", pr);
            if (!pr) {
                reject("deposit failed to start");
                return;
            }

            const paymentRes = await wallet.lnPay({pr}, fromMint);
            d("payment result: %o", paymentRes);
        });
    }
}

export default NDKWallet;
