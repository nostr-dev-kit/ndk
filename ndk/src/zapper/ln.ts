import { bech32 } from "@scure/base";
import type { NDK } from "../ndk";
import createDebug from "debug";
import type { Hexpubkey } from "../user";

const d = createDebug("ndk:zapper:ln");

export type NDKZapConfirmationLN = {
    preimage: string;
};

export type NDKPaymentConfirmationLN = {
    preimage: string;
};

export type LNPaymentRequest = string;

export type LnPaymentInfo = {
    pr: LNPaymentRequest;
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

export async function getNip57ZapSpecFromLud(
    { lud06, lud16 }: { lud06?: string; lud16?: string },
    ndk: NDK
): Promise<NDKLnUrlData | undefined> {
    let zapEndpoint: string | undefined;

    if (lud16 && !lud16.startsWith("LNURL")) {
        const [name, domain] = lud16.split("@");
        zapEndpoint = `https://${domain}/.well-known/lnurlp/${name}`;
    } else if (lud06) {
        const { words } = bech32.decode(lud06, 1000);
        const data = bech32.fromWords(words);
        const utf8Decoder = new TextDecoder("utf-8");
        zapEndpoint = utf8Decoder.decode(data);
    }

    if (!zapEndpoint) {
        d("No zap endpoint found %o", { lud06, lud16 });
        throw new Error("No zap endpoint found");
    }

    try {
        const _fetch = ndk.httpFetch || fetch;
        const response = await _fetch(zapEndpoint);

        if (response.status !== 200) {
            const text = await response.text();
            throw new Error(`Unable to fetch zap endpoint ${zapEndpoint}: ${text}`);
        }

        return await response.json();
    } catch (e) {
        throw new Error(`Unable to fetch zap endpoint ${zapEndpoint}: ${e}`);
    }
}
