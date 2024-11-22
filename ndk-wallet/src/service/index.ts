import type {
    CashuPaymentInfo,
    LnPaymentInfo,
    NDKEvent,
    NDKNutzap,
    NDKPaymentConfirmationCashu,
    NDKPaymentConfirmationLN,
    NDKUser,
    NDKZapDetails,
} from "@nostr-dev-kit/ndk";
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
import { NutzapMonitor } from "./nutzap-monitor/index.js";

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
    private nutzapMonitor: NutzapMonitor | undefined;

    constructor(ndk: NDK) {
        super();
        this.ndk = ndk;

        this.ndk.walletConfig ??= {};
        this.ndk.walletConfig.onCashuPay = this.onCashuPay.bind(this);
        this.ndk.walletConfig.onLnPay = this.onLnPay.bind(this);
    }

    async onCashuPay(
        payment: NDKZapDetails<CashuPaymentInfo>
    ): Promise<NDKPaymentConfirmationCashu | undefined> {
        if (!this.defaultWallet) throw new Error("No wallet available");

        return this.defaultWallet.cashuPay(payment);
    }

    async onLnPay(
        payment: NDKZapDetails<LnPaymentInfo>
    ): Promise<NDKPaymentConfirmationLN | undefined> {
        if (!this.defaultWallet) throw new Error("No wallet available");

        return this.defaultWallet.lnPay(payment);
    }

    private alreadyHasWallet(wallet: NDKWallet): boolean {
        if (wallet instanceof NDKCashuWallet) {
            return this.wallets.some(
                (w) => w instanceof NDKCashuWallet && w.event?.id === wallet.event?.id
            );
        }

        return false;
    }

    /**
     * Starts monitoring changes for the user's wallets
     */
    public start({ user, walletEvent }: { user?: NDKUser; walletEvent?: NDKEvent } = {}) {
        // todo: check NIP-78 configuration for webln/nwc/nip-61 settings
        this.lifecycle = new NDKWalletLifecycle(this.ndk, user ?? this.ndk.activeUser!);
        this.lifecycle.on("mintlist:ready", (mintList: NDKCashuMintList) => {
            this.startNutzapMonitor(mintList);
        });

        this.lifecycle.on("wallet:default", (wallet: NDKWallet) => {
            d("default wallet ready", wallet.type);
            this.defaultWallet = wallet;
            this.emit("wallet:default", wallet);
        });

        this.lifecycle.on("wallet", (wallet: NDKWallet) => {
            d("wallet ready", wallet.type);
            if (this.alreadyHasWallet(wallet)) {
                return;
            }

            this.wallets.push(wallet);
            this.emit("wallets");

            // if we have a new wallet and the nutzap monitor
            // is already running, add the wallet to the monitor
            if (this.nutzapMonitor) {
                this.nutzapMonitor.addWallet(wallet as NDKCashuWallet);
            }
        });

        this.lifecycle.on("ready", () => {
            this.state = "ready";
            this.emit("ready");
        });

        this.lifecycle.start(walletEvent);
    }

    /**
     * Configures NDK to use a webln wallet
     */
    public useWebLN() {
        const wallet = new NDKWebLNWallet();
        this.ndk.walletConfig ??= {};
        this.ndk.walletConfig.onCashuPay = wallet.cashuPay.bind(wallet);
        this.ndk.walletConfig.onLnPay = wallet.lnPay.bind(wallet);
    }

    /**
     * Starts monitoring for nutzaps
     * @param mintList User's mint list (kind:10019)
     */
    public startNutzapMonitor(mintList: NDKCashuMintList) {
        d("starting nutzap monitor");
        if (this.nutzapMonitor) throw new Error("Nutzap monitor already started");

        const relaysSet = mintList.relaySet;
        if (!relaysSet) throw new Error("Mint list has no relay set");

        this.nutzapMonitor = new NutzapMonitor(this.ndk, this.ndk.activeUser!, relaysSet);
        this.wallets
            .filter((w) => w instanceof NDKCashuWallet)
            .forEach((w) => this.nutzapMonitor!.addWallet(w));

        this.nutzapMonitor.on("redeem", (nutzap: NDKNutzap) => {
            this.emit("nutzap", nutzap);
        });

        this.nutzapMonitor.start();
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
