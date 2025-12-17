import type { Wallet, MintQuoteResponse, Proof, OutputType, P2PKTag } from "@cashu/cashu-ts";

/**
 * Ensures a pubkey is in the correct format for Cashu.
 *
 * Cashu expects a pubkey to start with "02" and be 66 characters long.
 *
 * @param pubkey
 * @returns The
 */
export function ensureIsCashuPubkey(pubkey?: string): string | undefined {
    if (!pubkey) return;

    let _pubkey = pubkey;

    if (_pubkey.length === 64) _pubkey = `02${_pubkey}`;
    if (_pubkey.length !== 66) throw new Error("Invalid pubkey");

    return _pubkey;
}

export async function mintProofs(
    wallet: Wallet,
    quote: MintQuoteResponse,
    amount: number,
    mint: string,
    p2pk?: string,
    proofTags?: [string, string][],
): Promise<{ proofs: Proof[]; mint: string }> {
    const mintTokenAttempt = (resolve: (value: any) => void, reject: (reason?: any) => void, attempt: number) => {
        const pubkey = ensureIsCashuPubkey(p2pk);

        // Build OutputType for P2PK if pubkey is provided
        let outputType: OutputType | undefined;
        if (pubkey) {
            outputType = {
                type: 'p2pk',
                options: {
                    pubkey,
                    ...(proofTags && proofTags.length > 0 ? { additionalTags: proofTags as P2PKTag[] } : {}),
                },
            };
        }

        wallet
            .mintProofsBolt11(amount, quote.quote, {}, outputType)
            .then((mintProofs) => {
                console.debug("minted tokens", mintProofs);

                resolve({
                    proofs: mintProofs,
                    mint: mint,
                });
            })
            .catch((e) => {
                attempt++;
                if (attempt <= 3) {
                    console.error("error minting tokens", e);
                    setTimeout(() => mintTokenAttempt(resolve, reject, attempt), attempt * 1500);
                } else {
                    reject(e);
                }
            });
    };

    return new Promise((resolve, reject) => {
        mintTokenAttempt(resolve, reject, 0);
    });
}
