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
import {
    getNip57ZapSpecFromLud,
    type LnPaymentInfo,
    type NDKLnUrlData,
    type NDKPaymentConfirmationLN,
    type NDKZapConfirmationLN,
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

    /**
     * If this payment is for a nip57 zap, this will contain the zap request.
     */
    nip57ZapRequest?: NDKEvent;

    /**
     * When set to true, when a pubkey is not zappable, we will
     * automatically fallback to using NIP-61.
     * 
     * Every pubkey must be able to receive money.
     * 
     * @default false
     */
    nutzapAsFallback?: boolean;
};

export type NDKZapConfirmation = NDKZapConfirmationLN | NDKZapConfirmationCashu;

export type NDKPaymentConfirmation = NDKPaymentConfirmationLN | NDKNutzap;

export type NDKZapSplit = {
    pubkey: string;
    amount: number;
};

export type NDKZapMethod = "nip57" | "nip61";
export type NDKLnLudData = { lud06?: string; lud16?: string; };

export type NDKZapMethodInfo = NDKLnLudData | CashuPaymentInfo;

export type LnPayCb = (
    payment: NDKZapDetails<LnPaymentInfo>
) => Promise<NDKPaymentConfirmationLN | undefined>;
export type CashuPayCb = (
    payment: NDKZapDetails<CashuPaymentInfo>,
    onLnInvoice?: (pr: string) => void
) => Promise<NDKPaymentConfirmationCashu | undefined>;
export type OnCompleteCb = (
    results: Map<NDKZapSplit, NDKPaymentConfirmation | Error | undefined>
) => void;

interface NDKZapperOptions {
    /**
     * Comment to include in the zap event
     */
    comment?: string;

    /**
     * Extra tags to add to the zap event
     */
    tags?: NDKTag[];
    signer?: NDKSigner;
    lnPay?: LnPayCb;
    cashuPay?: CashuPayCb;
    onComplete?: OnCompleteCb;
    nutzapAsFallback?: boolean;
    ndk?: NDK;
}

/**
 *
 */
class NDKZapper extends EventEmitter<{
    /**
     * An LN invoice has been fetched.
     * @param param0 
     * @returns 
     */
    ln_invoice: ({ amount, recipientPubkey, unit, nip57ZapRequest, pr, type }: {
        amount: number;
        recipientPubkey: string;
        unit: string;
        nip57ZapRequest?: NDKEvent;
        pr: string;
        type: NDKZapMethod;
    }) => void;
    
    ln_payment: ({ preimage, amount, recipientPubkey, unit, nip57ZapRequest, pr }: {
        preimage: string;
        amount: number;
        recipientPubkey: string;
        pr: string;
        unit: string;
        nip57ZapRequest?: NDKEvent;
        type: NDKZapMethod
    }) => void;
    
    /**
     * Emitted when a zap split has been completed
     */
    "split:complete": (
        split: NDKZapSplit,
        info: NDKPaymentConfirmation | Error | undefined
    ) => void;

    complete: (results: Map<NDKZapSplit, NDKPaymentConfirmation | Error | undefined>) => void;

    notice: (message: string) => void;
}> {
    public target: NDKEvent | NDKUser;
    public ndk: NDK;
    public comment?: string;
    public amount: number;
    public unit: string;
    public tags?: NDKTag[];
    public signer?: NDKSigner;
    public zapMethod?: NDKZapMethod;
    public nutzapAsFallback?: boolean;

    public lnPay?: LnPayCb;

    /**
     * Called when a cashu payment is to be made.
     * This function should swap/mint proofs for the required amount, in the required unit,
     * in any of the provided mints and return the proofs and mint used.
     */
    public cashuPay?: CashuPayCb;
    public onComplete?: OnCompleteCb;

    public maxRelays = 3;

    /**
     * 
     * @param target The target of the zap
     * @param amount The amount to send indicated in the unit
     * @param unit The unit of the amount
     * @param opts Options for the zap
     */
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
        this.nutzapAsFallback = opts.nutzapAsFallback ?? false;

        this.lnPay = opts.lnPay || this.ndk.walletConfig?.lnPay;
        this.cashuPay = opts.cashuPay || this.ndk.walletConfig?.cashuPay;
        this.onComplete = opts.onComplete || this.ndk.walletConfig?.onPaymentComplete;
    }

    /**
     * Initiate zapping process
     * 
     * This function will calculate the splits for this zap and initiate each zap split.
     */
    async zap(methods?: NDKZapMethod[]) {
        // get all splits
        const splits = this.getZapSplits();
        const results = new Map<NDKZapSplit, NDKPaymentConfirmation | Error | undefined>();

        await Promise.all(
            splits.map(async (split) => {
                let result: NDKPaymentConfirmation | Error | undefined;

                try {
                    result = await this.zapSplit(split, methods);
                } catch (e: any) {
                    result = new Error(e.message);
                }

                this.emit("split:complete", split, result);
                results.set(split, result);
            })
        );

        this.emit("complete", results);
        if (this.onComplete) this.onComplete(results);

        return results;
    }

    private async zapNip57(split: NDKZapSplit, data: NDKLnLudData): Promise<NDKPaymentConfirmation | undefined> {
        if (!this.lnPay) throw new Error("No lnPay function available");

        const zapSpec = await getNip57ZapSpecFromLud(data, this.ndk);
        if (!zapSpec) throw new Error("No zap spec available for recipient");
        
        const relays = await this.relays(split.pubkey);
        const zapRequest = await generateZapRequest(
            this.target,
            this.ndk,
            zapSpec,
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

        const pr = await this.getLnInvoice(zapRequest, split.amount, zapSpec);

        if (!pr) {
            d("Unable to get payment request");
            throw new Error("Unable to get payment request");
        }

        this.emit("ln_invoice", {
            amount: split.amount,
            recipientPubkey: split.pubkey,
            unit: this.unit,
            nip57ZapRequest: zapRequest,
            pr,
            type: "nip57"
        });

        const res = await this.lnPay(
            {
                target: this.target,
                recipientPubkey: split.pubkey,
                paymentDescription: "NIP-57 Zap",
                pr,
                amount: split.amount,
                unit: this.unit,
                nip57ZapRequest: zapRequest,
            }
        );

        if (res?.preimage) {
            this.emit("ln_payment", {
                preimage: res.preimage,
                amount: split.amount,
                recipientPubkey: split.pubkey,
                pr,
                unit: this.unit,
                nip57ZapRequest: zapRequest,
                type: "nip57"
            });
        }

        return res;
    }

    /**
     * Fetches information about a NIP-61 zap and asks the caller to create cashu proofs for the zap.
     * 
     * (note that the cashuPay function can use any method to create the proofs, including using lightning
     * to mint proofs in the specified mint, the responsibility of minting the proofs is delegated to the caller (e.g. ndk-wallet))
     */
    async zapNip61(split: NDKZapSplit, data?: CashuPaymentInfo): Promise<NDKNutzap | Error | undefined> {
        if (!this.cashuPay) throw new Error("No cashuPay function available");
        
        let ret: NDKPaymentConfirmationCashu | undefined;
        ret = await this.cashuPay({
            target: this.target,
            recipientPubkey: split.pubkey,
            paymentDescription: "NIP-61 Zap",
            amount: split.amount,
            unit: this.unit,
            ...(data ?? {}),
        }, (pr: string) => {
            this.emit("ln_invoice", {
                pr,
                amount: split.amount,
                recipientPubkey: split.pubkey,
                unit: this.unit,
                type: "nip61"
            });
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

            return nutzap;
        }
    }

    /**
     * Get the zap methods available for the recipient and initiates the zap
     * in the desired method.
     * @param split 
     * @param methods - The methods to try, if not provided, all methods will be tried.
     * @returns 
     */
    async zapSplit(split: NDKZapSplit, methods?: NDKZapMethod[]): Promise<NDKPaymentConfirmation | undefined> {
        const recipient = this.ndk.getUser({ pubkey: split.pubkey });
        let zapMethods = await recipient.getZapInfo(2500);
        let retVal: NDKPaymentConfirmation | Error | undefined;

        const canFallbackToNip61 = this.nutzapAsFallback && this.cashuPay;

        if (zapMethods.size === 0 && !canFallbackToNip61) throw new Error("No zap method available for recipient and NIP-61 fallback is disabled");

        const nip61Fallback = async () => {
            if (!this.nutzapAsFallback) return;

            const relayLists = await getRelayListForUsers([split.pubkey], this.ndk);
            let relayUrls = relayLists.get(split.pubkey)?.readRelayUrls;
            relayUrls = this.ndk.pool.connectedRelays().map((r) => r.url);
            return await this.zapNip61(split, {
                // use the user's relay list
                relays: relayUrls,
                
                // lock to the user's actual pubkey
                p2pk: split.pubkey,

                // allow intramint fallback
                allowIntramintFallback: !!canFallbackToNip61,
            });
        }

        const canUseNip61= !methods || methods.includes("nip61");
        const canUseNip57= !methods || methods.includes("nip57");

        const nip61Method = zapMethods.get("nip61") as CashuPaymentInfo;
        if (nip61Method && canUseNip61) {
            try {
                retVal = await this.zapNip61(split, nip61Method);
                if (retVal instanceof NDKNutzap) return retVal;
            } catch (e: any) {
                this.emit("notice", `NIP-61 attempt failed: ${e.message}`);
            }
        } 

        const nip57Method = zapMethods.get("nip57") as NDKLnLudData;
        if (nip57Method && canUseNip57) {
            try {
                retVal = await this.zapNip57(split, nip57Method);
                if (!(retVal instanceof Error)) return retVal;
            } catch (e: any) {
                this.emit("notice", `NIP-57 attempt failed: ${e.message}`);
            }
        }

        if (canFallbackToNip61) {
            retVal = await nip61Fallback();

            if (retVal instanceof Error) throw retVal;
            return retVal;
        } else {
            this.emit("notice", "Zap methods exhausted and there was no fallback to NIP-61");
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
    async getZapMethods(
        ndk: NDK,
        recipient: Hexpubkey,
        timeout = 2500
    ): Promise<Map<NDKZapMethod, NDKZapMethodInfo>> {
        const user = ndk.getUser({ pubkey: recipient });
        return await user.getZapInfo(timeout)
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
