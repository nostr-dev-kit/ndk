import type { NDK } from "../ndk";
import type { NDKTag } from "../events";
import type { NDKEvent } from "../events";
import type { Hexpubkey } from "../user";
import { NDKUser } from "../user";
import type { NDKSigner } from "../signers";
import createDebug from "debug";

import { getRelayListForUsers } from "../utils/get-users-relay-list";
import { EventEmitter } from "tseep";
import { generateZapRequest } from "./nip57";
import { NDKNutzap } from "../events/kinds/nutzap";
import type {
    LnPaymentInfo,
    NDKLnUrlData,
    NDKPaymentConfirmationLN,
    NDKZapConfirmationLN,
} from "./ln";
import type {
    NDKZapConfirmationCashu,
    CashuPaymentInfo,
    NDKPaymentConfirmationCashu,
} from "./nip61";
import { NDKRelaySet } from "../relay/sets";

const d = createDebug("ndk:zapper");

export type NDKZapDetails<T> = T & {
    /**
     * Target of the zap
     */
    target: NDKEvent | NDKUser;

    /**
     * Comment for the zap
     */
    comment?: string;

    /**
     * Tags to add to the zap
     */
    tags?: NDKTag[];

    /**
     * Pubkey of the user to zap to
     */
    recipientPubkey: string;

    /**
     * Amount of the payment
     */
    amount: number;

    /**
     * Unit of the payment (e.g. msat)
     */
    unit: string;

    /**
     * Description of the payment for the sender's record
     */
    paymentDescription?: string;
};

export type NDKZapConfirmation = NDKZapConfirmationLN | NDKZapConfirmationCashu;

export type NDKPaymentConfirmation = NDKPaymentConfirmationLN | NDKNutzap;

export type NDKZapSplit = {
    pubkey: string;
    amount: number;
};

export type NDKZapMethod = "nip57" | "nip61";

type ZapMethodInfo = {
    nip57: NDKLnUrlData;
    nip61: CashuPaymentInfo;
};

export type NDKZapMethodInfo = {
    type: NDKZapMethod;

    data: ZapMethodInfo[NDKZapMethod];
};

export type LnPayCb = (
    payment: NDKZapDetails<LnPaymentInfo>
) => Promise<NDKPaymentConfirmationLN | undefined>;
export type CashuPayCb = (
    payment: NDKZapDetails<CashuPaymentInfo>
) => Promise<NDKPaymentConfirmationCashu | undefined>;
export type OnCompleteCb = (
    results: Map<NDKZapSplit, NDKPaymentConfirmation | Error | undefined>
) => void;

interface NDKZapperOptions {
    comment?: string;
    tags?: NDKTag[];
    signer?: NDKSigner;
    lnPay?: LnPayCb;
    cashuPay?: CashuPayCb;
    onComplete?: OnCompleteCb;
    ndk?: NDK;
}

/**
 *
 */
class NDKZapper extends EventEmitter<{
    /**
     * Emitted when a zap split has been completed
     */
    "split:complete": (
        split: NDKZapSplit,
        info: NDKPaymentConfirmation | Error | undefined
    ) => void;

    complete: (results: Map<NDKZapSplit, NDKPaymentConfirmation | Error | undefined>) => void;
}> {
    public target: NDKEvent | NDKUser;
    public ndk: NDK;
    public comment?: string;
    public amount: number;
    public unit: string;
    public tags?: NDKTag[];
    public signer?: NDKSigner;
    public zapMethod?: NDKZapMethod;

    public lnPay?: LnPayCb;

    /**
     * Called when a cashu payment is to be made.
     * This function should swap/mint proofs for the required amount, in the required unit,
     * in any of the provided mints and return the proofs and mint used.
     */
    public cashuPay?: CashuPayCb;
    public onComplete?: OnCompleteCb;

    public maxRelays = 3;

    constructor(
        target: NDKEvent | NDKUser,
        amount: number,
        unit: string = "msat",
        opts: NDKZapperOptions = {}
    ) {
        super();
        this.target = target;
        this.ndk = opts.ndk || target.ndk!;
        if (!this.ndk) {
            throw new Error("No NDK instance provided");
        }

        this.amount = amount;
        this.comment = opts.comment;
        this.unit = unit;
        this.tags = opts.tags;
        this.signer = opts.signer;

        this.lnPay = opts.lnPay || this.ndk.walletConfig?.lnPay;
        this.cashuPay = opts.cashuPay || this.ndk.walletConfig?.cashuPay;
        this.onComplete = opts.onComplete || this.ndk.walletConfig?.onPaymentComplete;
    }

    /**
     * Initiate zapping process
     * 
     * This function will calculate the splits for this zap and initiate each zap split.
     */
    async zap() {
        // get all splits
        const splits = this.getZapSplits();
        const results = new Map<NDKZapSplit, NDKPaymentConfirmation | Error | undefined>();

        await Promise.all(
            splits.map(async (split) => {
                let result: NDKPaymentConfirmation | Error | undefined;

                try {
                    result = await this.zapSplit(split);
                } catch (e: any) {
                    result = e;
                }

                this.emit("split:complete", split, result);
                results.set(split, result);
            })
        );

        this.emit("complete", results);
        if (this.onComplete) this.onComplete(results);

        return results;
    }

    private async zapNip57(split: NDKZapSplit, data: NDKLnUrlData): Promise<NDKPaymentConfirmation | undefined> {
        if (!this.lnPay) throw new Error("No lnPay function available");
        
        const relays = await this.relays(split.pubkey);
        const zapRequest = await generateZapRequest(
            this.target,
            this.ndk,
            data,
            split.pubkey,
            split.amount,
            relays,
            this.comment,
            this.tags,
            this.signer
        );

        if (!zapRequest) {
            d("Unable to generate zap request");
            throw new Error("Unable to generate zap request");
        }

        const pr = await this.getLnInvoice(zapRequest, split.amount, data);

        if (!pr) {
            d("Unable to get payment request");
            throw new Error("Unable to get payment request");
        }

        return await this.lnPay(
            {
                target: this.target,
                recipientPubkey: split.pubkey,
                paymentDescription: "NIP-57 Zap",
                pr,
                amount: split.amount,
                unit: this.unit,
            }
        );
    }

    /**
     * Fetches information about a NIP-61 zap and asks the caller to create cashu proofs for the zap.
     * 
     * (note that the cashuPay function can use any method to create the proofs, including using lightning
     * to mint proofs in the specified mint, the responsibility of minting the proofs is delegated to the caller (e.g. ndk-wallet))
     */
    async zapNip61(split: NDKZapSplit, data: CashuPaymentInfo): Promise<NDKNutzap | Error | undefined> {
        if (!this.cashuPay) throw new Error("No cashuPay function available");
        
        let ret: NDKPaymentConfirmationCashu | undefined;
        ret = await this.cashuPay({
            target: this.target,
            recipientPubkey: split.pubkey,
            paymentDescription: "NIP-61 Zap",
            amount: split.amount,
            unit: this.unit,
            ...data,
        });

        d("NIP-61 Zap result: %o", ret);

        if (ret instanceof Error) {
            // we assign the error instead of throwing it so that we can try the next zap method
            // but we want to keep the error around in case there is no successful zap
            return ret;
        } else if (ret) {
            const { proofs, mint } = ret as NDKZapConfirmationCashu;

            if (!proofs || !mint)
                throw new Error(
                    "Invalid zap confirmation: missing proofs or mint: " + ret
                );

            const relays = await this.relays(split.pubkey);
            const relaySet = NDKRelaySet.fromRelayUrls(relays, this.ndk);

            // we have a confirmation, generate the nutzap
            const nutzap = new NDKNutzap(this.ndk);
            nutzap.tags = [...nutzap.tags, ...(this.tags || [])];
            nutzap.proofs = proofs;
            nutzap.mint = mint;
            nutzap.target = this.target;
            nutzap.comment = this.comment;
            nutzap.unit = this.unit;
            nutzap.recipientPubkey = split.pubkey;
            await nutzap.sign(this.signer);
            nutzap.publish(relaySet);

            // mark that we have zapped
            return nutzap;
        }
    }

    /**
     * Get the zap methods available for the recipient and initiates the zap
     * in the desired method.
     * @param split 
     * @returns 
     */
    async zapSplit(split: NDKZapSplit): Promise<NDKPaymentConfirmation | undefined> {
        const zapped = false;
        let zapMethods = await this.getZapMethods(this.ndk, split.pubkey);
        let retVal: NDKPaymentConfirmation | Error | undefined;

        if (zapMethods.length === 0) throw new Error("No zap method available for recipient");

        // prefer nip61 if available
        zapMethods = zapMethods.sort((a, b) => {
            if (a.type === "nip61") return -1;
            if (b.type === "nip61") return 1;
            return 0;
        });

        for (const zapMethod of zapMethods) {
            if (zapped) break;

            d(
                "Zapping to %s with %d %s using %s",
                split.pubkey,
                split.amount,
                this.unit,
                zapMethod.type
            );

            try {
                if (zapMethod.type === "nip61") {
                    retVal = await this.zapNip61(split, zapMethod.data as CashuPaymentInfo);
                } else if (zapMethod.type === "nip57") {
                    retVal = await this.zapNip57(split, zapMethod.data as NDKLnUrlData);
                }

                if (!(retVal instanceof Error)) {
                    // d("looks like zap with method", zapMethod.type, "worked", retVal);
                    break;
                }
            } catch (e: any) {
                if (e instanceof Error) retVal = e;
                else retVal = new Error(e);
                d(
                    "Error zapping to %s with %d %s using %s: %o",
                    split.pubkey,
                    split.amount,
                    this.unit,
                    zapMethod.type,
                    e
                );
            }
        }

        if (retVal instanceof Error) throw retVal;

        return retVal;
    }

    /**
     * Gets a bolt11 for a nip57 zap
     * @param event
     * @param amount
     * @param zapEndpoint
     * @returns
     */
    public async getLnInvoice(
        zapRequest: NDKEvent,
        amount: number,
        data: NDKLnUrlData
    ): Promise<string | null> {
        const zapEndpoint = data.callback;
        const eventPayload = JSON.stringify(zapRequest.rawEvent());
        d(
            `Fetching invoice from ${zapEndpoint}?` +
                new URLSearchParams({
                    amount: amount.toString(),
                    nostr: eventPayload,
                })
        );
        const url = new URL(zapEndpoint);
        url.searchParams.append("amount", amount.toString());
        url.searchParams.append("nostr", eventPayload);
        d(`Fetching invoice from ${url.toString()}`);
        const response = await fetch(url.toString());
        d(`Got response from zap endpoint: ${zapEndpoint}`, { status: response.status });
        if (response.status !== 200) {
            d(`Received non-200 status from zap endpoint: ${zapEndpoint}`, {
                status: response.status,
                amount: amount,
                nostr: eventPayload,
            });
            const text = await response.text();
            throw new Error(`Unable to fetch zap endpoint ${zapEndpoint}: ${text}`);
        }
        const body = await response.json();

        return body.pr;
    }

    public getZapSplits(): NDKZapSplit[] {
        if (this.target instanceof NDKUser) {
            return [
                {
                    pubkey: this.target.pubkey,
                    amount: this.amount,
                },
            ];
        }

        const zapTags = this.target.getMatchingTags("zap");
        if (zapTags.length === 0) {
            return [
                {
                    pubkey: this.target.pubkey,
                    amount: this.amount,
                },
            ];
        }

        const splits: NDKZapSplit[] = [];
        const total = zapTags.reduce((acc, tag) => acc + parseInt(tag[2]), 0);

        for (const tag of zapTags) {
            const pubkey = tag[1];
            const amount = Math.floor((parseInt(tag[2]) / total) * this.amount);
            splits.push({ pubkey, amount });
        }

        return splits;
    }

    /**
     * Gets the zap method that should be used to zap a pubbkey
     * @param ndk
     * @param pubkey
     * @returns
     */
    async getZapMethods(ndk: NDK, recipient: Hexpubkey): Promise<NDKZapMethodInfo[]> {
        const methods: NDKZapMethod[] = [];

        if (this.cashuPay) methods.push("nip61");
        if (this.lnPay) methods.push("nip57");

        // if there are no methods available, return an empty array
        if (methods.length === 0) throw new Error("There are no payment methods available! Please set at least one of lnPay or cashuPay");

        const user = ndk.getUser({ pubkey: recipient });
        const zapInfo = await user.getZapInfo(false, methods);

        d("Zap info for %s: %o", user.npub, zapInfo);

        return zapInfo;
    }

    /**
     * @returns the relays to use for the zap request
     */
    public async relays(pubkey: Hexpubkey): Promise<string[]> {
        let r: string[] = [];

        if (this.ndk?.activeUser) {
            const relayLists = await getRelayListForUsers(
                [this.ndk.activeUser.pubkey, pubkey],
                this.ndk
            );

            const relayScores = new Map<string, number>();

            // go through the relay lists and try to get relays that are shared between the two users
            for (const relayList of relayLists.values()) {
                for (const url of relayList.readRelayUrls) {
                    const score = relayScores.get(url) || 0;
                    relayScores.set(url, score + 1);
                }
            }

            // get the relays that are shared between the two users
            r = Array.from(relayScores.entries())
                .sort((a, b) => b[1] - a[1])
                .map(([url]) => url)
                .slice(0, this.maxRelays);
        }

        if (this.ndk?.pool?.permanentAndConnectedRelays().length) {
            r = this.ndk.pool.permanentAndConnectedRelays().map((relay) => relay.url);
        }

        if (!r.length) {
            r = [];
        }

        return r;
    }
}

export { NDKZapper };
