import type { NDKNutzap } from "@nostr-dev-kit/ndk";
import type NDK from "@nostr-dev-kit/ndk";
import { NDKCashuMintList } from "@nostr-dev-kit/ndk";
import { NDKCashuWallet } from "../cashu/wallet.js";
import { EventEmitter } from "tseep";
import createDebug from "debug";
import NDKWalletLifecycle from "./lifecycle/index.js";
import type { MintUrl } from "../cashu/mint/utils.js";
import type { NDKCashuToken } from "../cashu/token.js";
import { NDKWallet } from "../wallets/index.js";

const d = createDebug("ndk-wallet:wallet");

/**
 * The NDKWalletService provides a shortcut to discover and interact with
 * users wallets.
 *
 */
class NDKWalletService extends EventEmitter<{
    /**
     * New default was has been established
     * @param wallet
     */
    "wallet:default": (wallet: NDKWallet) => void;
    mintlist: (mintList: NDKCashuMintList) => void;

    /**
     * A wallet has become available
     */
    wallet: (wallet: NDKWallet) => void;
    wallets: () => void;
    "wallet:balance": (wallet: NDKWallet) => void;

    "nutzap:seen": (nutzap: NDKNutzap) => void;
    nutzap: (nutzap: NDKNutzap) => void;
    "nutzap:failed": (nutzap: NDKNutzap) => void;

    ready: () => void;
}> {
    public ndk: NDK;
    public wallets: NDKWallet[] = [];
    public state: "loading" | "ready" = "loading";
    public defaultWallet?: NDKWallet;

    private lifecycle: NDKWalletLifecycle | undefined;

    constructor(ndk: NDK) {
        super();
        this.ndk = ndk;
    }

    /**
     * Publishes the mint list tying to a specific wallet
     */
    async setMintList(wallet: NDKCashuWallet) {
        const mintList = new NDKCashuMintList(this.ndk);
        mintList.relays = wallet.relays;
        mintList.mints = wallet.mints;
        mintList.p2pk = await wallet.getP2pk();
        return mintList.publishReplaceable();
    }

    /**
     * Transfers tokens from one mint to another
     */
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

            const paymentRes = await wallet.lnPay({ pr }, fromMint);
            d("payment result: %o", paymentRes);
        });
    }
}

export default NDKWalletService;
