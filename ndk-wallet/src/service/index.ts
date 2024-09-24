import type { CashuPaymentInfo, LnPaymentInfo, NDKNutzap, NDKPaymentConfirmationCashu, NDKPaymentConfirmationLN, NDKUser, NDKZapDetails } from "@nostr-dev-kit/ndk";
import type NDK from "@nostr-dev-kit/ndk";
import { NDKCashuMintList } from "@nostr-dev-kit/ndk";
import { NDKCashuWallet } from "../cashu/wallet.js";
import { EventEmitter } from "tseep";
import createDebug from "debug";
import NDKWalletLifecycle from "./lifecycle/index.js";
import type { MintUrl } from "../cashu/mint/utils.js";
import type { NDKCashuToken } from "../cashu/token.js";
import { NDKWebLNWallet } from "../ln/index.js";
import { NDKWallet } from "../wallet/index.js";

const d = createDebug("ndk-wallet:wallet");

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
    "nutzap:redeemed": (nutzap: NDKNutzap) => void;
    "nutzap:failed": (nutzap: NDKNutzap) => void;

    ready: () => void;
}> {
    public ndk: NDK;
    public wallets: NDKWallet[] = [];
    public state: 'loading' | 'ready' = 'loading';

    private lifecycle: NDKWalletLifecycle | undefined;

    constructor(ndk: NDK) {
        super();
        this.ndk = ndk;

        this.ndk.walletConfig ??= { onPaymentComplete: () => {}}
        this.ndk.walletConfig.onCashuPay = this.onCashuPay.bind(this) 
        this.ndk.walletConfig.onLnPay = this.onLnPay.bind(this)
    }

    async onCashuPay(payment: NDKZapDetails<CashuPaymentInfo>): Promise<NDKPaymentConfirmationCashu | undefined> {
        const wallet = this.wallets[0]
        if (!wallet) throw new Error("No wallet available");

        return wallet.cashuPay(payment);

        
        console.log('attempt to pay with default wallet', payment);
        return undefined;
    }

    async onLnPay(payment: NDKZapDetails<LnPaymentInfo>): Promise<NDKPaymentConfirmationLN | undefined> {
        console.log('attempt to pay with ln', payment)
        return undefined;
    }

    public createCashuWallet() {
        return new NDKCashuWallet(undefined, this.ndk);
    }

    /**
     * Starts monitoring changes for the user's wallets
     */
    public start(user?: NDKUser) {
        // try to load a webln wallet
        const weblnWallet = new NDKWebLNWallet();
        weblnWallet.on("ready", () => {
            this.wallets.push(weblnWallet);
            this.emit("wallet", weblnWallet);
            this.emit("ready");
        });
        
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

export default NDKWalletService;
