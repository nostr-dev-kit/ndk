import { EventEmitter } from "tseep";
import type { NDK } from "../ndk";
import { type PayInvoiceResponse, payInvoice } from "./pay_invoice";
import { NDKRelaySet } from "../relay/sets";
import type { NDKSigner } from "../signers";
import { NDKPrivateKeySigner } from "../signers/private-key";
import { NDKKind } from "../events/kinds";
import type { Debugger } from "debug";
import type { NDKUser } from "../user";
import { type NostrWalletConnectMethod, sendReq } from "./req";
import type { NDKEvent } from "../events";
import { getBalance } from "./get_balance";
import { getInfo, type GetInfoResponse } from "./get_info";
import { hexToBytes } from "@noble/hashes/utils";

export type NDKNWcCommands =
    | "pay_invoice"
    | "get_info"
    | "get_balance"
    | "get_transactions"
    | "get_invoice"
    | "get_invoices"
    | "get_invoice_status";

export interface NDKNwcResponse<T> {
    result_type: string;
    error?: {
        code:
            | "RATE_LIMITED"
            | "NOT_IMPLEMENTED"
            | "INSUFFICIENT_BALANCE"
            | "QUOTA_EXCEEDED"
            | "RESTRICTED"
            | "UNAUTHORIZED"
            | "INTERNAL"
            | "OTHER";
        message: string;
    };
    result?: T;
}

/**
 * Implements the Nostr Wallet Connect (NIP-47) protocol.
 * @example
 * const nwc = ndk.nwc("nostr+walletconnect://...");
 * const balance = await nwc.getBalance();
 * const payment = await nwc.payInvoice("lnbc1...");
 */
export class NDKNwc extends EventEmitter {
    public ndk: NDK;
    public debug: Debugger;

    /**
     * The Wallet Service's public key
     */
    public walletService: NDKUser;
    public relaySet: NDKRelaySet;
    public signer: NDKSigner;

    public active = false;

    /**
     *
     * @param opts: NostrWalletConnectOptions
     * @returns NDKNwc
     */
    constructor({
        ndk,
        pubkey,
        relayUrls,
        secret,
    }: {
        ndk: NDK;
        pubkey: string;
        relayUrls: string[];
        secret: string | Uint8Array;
    }) {
        super();

        this.ndk = ndk;
        this.walletService = ndk.getUser({ pubkey });
        this.relaySet = new NDKRelaySet(
            new Set(relayUrls.map((url) => ndk.pool.getRelay(url))),
            ndk
        );
        this.signer = new NDKPrivateKeySigner(
            secret instanceof Uint8Array ? secret : hexToBytes(secret)
        );
        this.debug = ndk.debug.extend("nwc");

        this.debug(`Starting with wallet service ${this.walletService.npub}`);
    }

    static async fromURI(ndk: NDK, uri: string): Promise<NDKNwc> {
        const u = new URL(uri);

        // validate protocol nostr+walletconnect
        if (u.protocol !== "nostr+walletconnect:") {
            throw new Error("Invalid protocol");
        }

        const nwc = new NDKNwc({
            ndk,
            pubkey: u.host ?? u.pathname,
            relayUrls: u.searchParams.getAll("relay") ?? [""],
            secret: u.searchParams.get("secret") ?? "",
        });

        return nwc;
    }

    /**
     * Blocks until we're subscribed to talk to the wallet service
     * @param msTimeout Timeout in ms to wait for the subscription to be ready
     * @returns
     */
    async blockUntilReady(msTimeout?: number): Promise<void> {
        const signerUser = await this.signer.user();

        const timeout = new Promise<void>((_, reject) => {
            setTimeout(() => {
                reject(new Error("Timeout"));
            }, msTimeout);
        });

        const subPromise = new Promise<void>((resolve) => {
            const sub = this.ndk.subscribe(
                {
                    kinds: [NDKKind.NostrWalletConnectRes],
                    "#p": [signerUser.pubkey],
                    limit: 1,
                },
                { groupable: false, subId: "nwc" },
                this.relaySet
            );

            sub.on("event", async (event: NDKEvent) => {
                this.debug("received response", event.rawEvent());

                const eTag = event.tagValue("e");

                if (!eTag) {
                    this.debug("Received an event without an e-tag");
                    return;
                }

                this.debug("received an event", eTag);
                try {
                    await event.decrypt(event.author, this.signer);
                    this.emit(eTag, event.content);
                } catch (e) {
                    this.debug("Failed to decrypt event", e);
                    return;
                }
            });

            sub.on("eose", () => {
                this.debug("Subscription ready");
                this.active = true;
                resolve();
            });

            sub.on("close", () => {
                this.debug("Subscription closed");
                this.active = false;
            });
        });

        const promises: Promise<void>[] = [subPromise];

        if (msTimeout) promises.push(timeout);

        return await Promise.race(promises);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async sendReq<T>(method: NostrWalletConnectMethod, params: any): Promise<NDKNwcResponse<T>> {
        return (await sendReq.call(this, method, params)) as NDKNwcResponse<T>;
    }

    async payInvoice(invoice: string): Promise<NDKNwcResponse<PayInvoiceResponse>> {
        return await payInvoice.call(this, invoice);
    }

    async getInfo(): Promise<NDKNwcResponse<GetInfoResponse>> {
        return await getInfo.call(this);
    }

    getBalance = getBalance.bind(this);
}
