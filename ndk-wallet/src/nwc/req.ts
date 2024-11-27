import { NDKEvent, NDKKind, NostrEvent } from "@nostr-dev-kit/ndk";
import type { NDKNWCWallet } from "./index.js";
import { NWCMethod, NWCRequestMap, NWCResponseMap } from "./types.js";
import { waitForResponse } from "./res.js";

// Base types for requests and responses
export interface NWCRequestBase {
    method: NWCMethod;
    params: Record<string, any>;
}

export interface NWCResponseBase<T = any> {
    result_type: NWCMethod;
    error?: {
        code: NWCErrorCode;
        message: string;
    };
    result: T | null;
}

// Error codes
export type NWCErrorCode = 
    | "RATE_LIMITED"
    | "NOT_IMPLEMENTED"
    | "INSUFFICIENT_BALANCE"
    | "QUOTA_EXCEEDED"
    | "RESTRICTED"
    | "UNAUTHORIZED"
    | "INTERNAL"
    | "OTHER"
    | "PAYMENT_FAILED"
    | "NOT_FOUND";

// Common types
export interface Transaction {
    type: "incoming" | "outgoing";
    invoice?: string;
    description?: string;
    description_hash?: string;
    preimage?: string;
    payment_hash: string;
    amount: number;
    fees_paid?: number;
    created_at: number;
    expires_at?: number;
    settled_at?: number;
    metadata?: Record<string, any>;
}

// Method-specific request params
export interface PayInvoiceParams {
    invoice: string;
    amount?: number;
}

export interface MakeInvoiceParams {
    amount: number;
    description?: string;
    description_hash?: string;
    expiry?: number;
}

export interface LookupInvoiceParams {
    payment_hash?: string;
    invoice?: string;
}

export interface ListTransactionsParams {
    from?: number;
    until?: number;
}

export async function sendReq<M extends keyof NWCRequestMap>(
    this: NDKNWCWallet,
    method: M,
    params: NWCRequestMap[M]
): Promise<NWCResponseBase<NWCResponseMap[M]>> {
    if (!this.walletService || !this.signer) {
        throw new Error("Wallet not initialized");
    }

    const event = new NDKEvent(this.ndk, {
        kind: NDKKind.NostrWalletConnectReq,
        tags: [["p", this.walletService.pubkey]],
        content: JSON.stringify({ method, params })
    } as NostrEvent);

    await event.encrypt(this.walletService, this.signer, 'nip04');
    await event.sign(this.signer);

    // Wait for response
    return new Promise<NWCResponseBase<NWCResponseMap[M]>>((resolve, reject) => {
        waitForResponse.call<NDKNWCWallet, [string], Promise<NWCResponseBase<NWCResponseMap[M]>>>(
            this,
            event.id
        ).then(resolve).catch(reject);

        event.publish(this.relaySet);
    });
}
