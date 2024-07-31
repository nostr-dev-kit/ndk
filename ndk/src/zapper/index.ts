import type { NDK } from "../ndk";
import type { NDKTag } from "../events";
import { NDKEvent } from "../events";
import type { Hexpubkey} from "../user";
import { NDKUser } from "../user";
import type { NDKSigner } from "../signers";
import createDebug from "debug";

import type { NostrEvent } from "nostr-tools";
import { nip57 } from "nostr-tools";
import { getRelayListForUsers } from "../utils/get-users-relay-list";
import { EventEmitter } from "tseep";

const d = createDebug("ndk:zapper");

export type LNPaymentRequest = string;

/**
 * Provides information that should be used to send a NIP-61 nutzap.
 * mints: URLs of the mints that can be used.
 * relays: URLs of the relays where nutzap must be published
 * p2pkPubkey: Optional pubkey to use for P2PK lock
 */
export type NutPaymentInfo = {
    /**
     * Mints that must be used for the payment
     */
    mints: string[];

    /**
     * Relays where nutzap must be published
     */
    relays: string[];

    /**
     * Optional pubkey to use for P2PK lock
     */
    p2pkPubkey?: string;
};

export type LnPaymentInfo = {
    pr: string;
};

export type NDKZapDetails<T> = {
    /**
     * Target of the zap
     */
    target: NDKEvent | NDKUser;

    /**
     * Comment for the zap
     */
    comment?: string;

    /**
     * Extra tags to add to the zap
     */
    extraTags?: NDKTag[];

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
     * Payment details
     */
    info: T;
};

export type NDKLUD18ServicePayerData = Partial<{
    name: { mandatory: boolean };
    pubkey: { mandatory: boolean };
    identifier: { mandatory: boolean };
    email: { mandatory: boolean };
    auth: {
        mandatory: boolean;
        k1: string;
    };
}> &
    Record<string, unknown>;

export type NDKLnUrlData = {
    tag: string;
    callback: string;
    minSendable: number;
    maxSendable: number;
    metadata: string;
    payerData?: NDKLUD18ServicePayerData;
    commentAllowed?: number;

    /**
     * Pubkey of the zapper that should publish zap receipts for this user
     */
    nostrPubkey?: Hexpubkey;
    allowsNostr?: boolean;
};

export type NDKZapConfirmationLN = {
    preimage: string;
};

export type NDKZapConfirmationNut = NDKEvent;

export type NDKZapConfirmation = NDKZapConfirmationLN | NDKZapConfirmationNut;

export type NDKZapSplit = {
    pubkey: string;
    amount: number;
};

export type NDKZapMethod = "nip57" | "nip61";

type ZapMethodInfo = {
    nip57: NDKLnUrlData;
    nip61: NutPaymentInfo;
};

export type NDKZapMethodInfo = {
    type: NDKZapMethod;

    data: ZapMethodInfo[NDKZapMethod];
};

/**
 *
 */
class NDKZapper extends EventEmitter<{
    complete: (info: NDKZapConfirmation | Error) => void;
}> {
    public target: NDKEvent | NDKUser;
    public ndk: NDK;
    public comment?: string;
    public amount: number;
    public unit: string;
    public extraTags?: NDKTag[];
    public signer?: NDKSigner;
    public zapMethod?: NDKZapMethod;

    public onLnPay?: (payment: NDKZapDetails<LnPaymentInfo>) => Promise<NDKZapConfirmation>;
    public onNutPay?: (payment: NDKZapDetails<NutPaymentInfo>) => Promise<NDKZapConfirmation>;
    public onComplete?: (info: NDKZapConfirmation | Error) => void;

    public maxRelays = 3;

    constructor(
        target: NDKEvent | NDKUser,
        amount: number,
        unit: string = "msat",
        comment?: string,
        ndk?: NDK,
        extraTags?: NDKTag[],
        signer?: NDKSigner
    ) {
        super();
        this.target = target;
        this.ndk = ndk || target.ndk!;
        if (!this.ndk) {
            throw new Error("No NDK instance provided");
        }

        this.amount = amount;
        this.comment = comment;
        this.unit = unit;
        this.extraTags = extraTags;
        this.signer = signer;
    }

    /**
     * Initiate zapping process
     */
    async zap() {
        // get all splits
        const splits = this.getZapSplits();

        await Promise.all(
            splits.map(async (split) => {
                this.zapSplit(split);
            })
        );
    }

    async zapSplit(split: NDKZapSplit) {
        const zapMethod = await this.getZapMethod(this.ndk, split.pubkey);

        if (!zapMethod) {
            const error = new Error("No zap method available for recipient");
            this.emit("complete", error);
            if (this.onComplete) this.onComplete(error);
            return;
        }

        let ret: NDKZapConfirmation | Error | undefined;

        d("Zapping to", split.pubkey, "with", split.amount, "msat using", zapMethod.type);

        try {
            switch (zapMethod.type) {
                case "nip61": {
                    const data = zapMethod.data as NutPaymentInfo;
                    ret = await this.onNutPay!({
                        target: this.target,
                        comment: this.comment,
                        extraTags: this.extraTags,
                        recipientPubkey: split.pubkey,
                        amount: split.amount,
                        unit: this.unit,
                        info: data,
                    });
                    break;
                }
                case "nip57": {
                    const lnUrlData = zapMethod.data as NDKLnUrlData;

                    const relays = await this.relays(split.pubkey);
                    const zapRequest = await this.generateNip57Request(
                        lnUrlData,
                        split.pubkey,
                        split.amount,
                        relays,
                        this.comment,
                        this.extraTags,
                        this.signer
                    );

                    if (!zapRequest) {
                        d("Unable to generate zap request");
                        return;
                    }

                    const pr = await this.getLnInvoice(zapRequest, split.amount, lnUrlData);

                    if (!pr) {
                        d("Unable to get payment request");
                        return;
                    }

                    ret = await this.onLnPay!({
                        target: this.target,
                        comment: this.comment,
                        recipientPubkey: split.pubkey,
                        amount: split.amount,
                        unit: this.unit,
                        info: { pr },
                    });

                    break;
                }
            }
        } catch (e: any) {
            ret = e;
        }

        if (!ret) ret = new Error("Unable to zap");

        this.emit("complete", ret);
        if (this.onComplete) {
            this.onComplete(ret);
        }
    }

    public async generateNip57Request(
        data: NDKLnUrlData,
        pubkey: string,
        amount: number, // amount to zap in millisatoshis
        relays: string[],
        comment?: string,
        extraTags?: NDKTag[],
        signer?: NDKSigner
    ): Promise<NDKEvent | null> {
        const zapEndpoint = data.callback;
        const zapRequest = nip57.makeZapRequest({
            profile: pubkey,

            // set the event to null since nostr-tools doesn't support nip-33 zaps
            event: null,
            amount,
            comment: comment || "",
            relays: relays.slice(0, 4),
        });

        // add the event tag if it exists; this supports both 'e' and 'a' tags
        if (this.target instanceof NDKEvent) {
            const tags = this.target.referenceTags();
            const nonPTags = tags.filter((tag) => tag[0] !== "p");
            zapRequest.tags.push(...nonPTags);
        }

        // zapRequest.tags.push(["lnurl", zapEndpoint]);

        const event = new NDKEvent(this.ndk, zapRequest as NostrEvent);
        if (extraTags) {
            event.tags = event.tags.concat(extraTags);
        }

        // make sure we only have one `p` tag
        event.tags = event.tags.filter((tag) => tag[0] !== "p");
        event.tags.push(["p", pubkey]);

        await event.sign(signer);

        return event;
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

    async getZapMethod(ndk: NDK, pubkey: string): Promise<NDKZapMethodInfo | undefined> {
        const methods: NDKZapMethod[] = [];

        if (this.onNutPay) methods.push("nip61");
        if (this.onLnPay) methods.push("nip57");

        d("Available zap methods", methods);

        if (methods.length === 0) {
            d("No zap methods available");
            throw new Error("No zap methods available");
        }

        const user = ndk.getUser({ pubkey });
        const zapInfo = await user.getZapInfo(false, methods);

        d("Zap info", zapInfo);

        return zapInfo[0];
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
