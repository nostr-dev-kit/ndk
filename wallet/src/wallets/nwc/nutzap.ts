import type { Proof } from "@cashu/cashu-ts";
import type NDK from "@nostr-dev-kit/ndk";
import { NDKCashuToken, type NDKNutzap } from "@nostr-dev-kit/ndk";
import { createOutTxEvent } from "../cashu/wallet/txs.js";
import type { RedeemNutzapsOpts } from "../index.js";
import type { NDKNWCWallet } from "./index.js";

export async function redeemNutzaps(
    this: NDKNWCWallet,
    nutzaps: NDKNutzap[],
    privkey: string,
    { cashuWallet, proofs, mint }: RedeemNutzapsOpts,
): Promise<number> {
    proofs ??= nutzaps.flatMap((n) => n.proofs);
    if (!cashuWallet) {
        if (!mint) throw new Error("No mint provided");
        cashuWallet = await this.getCashuWallet(mint);
    } else {
        mint = cashuWallet.mint.mintUrl;
    }

    const info = await this.getInfo();

    if (!info.methods.includes("make_invoice")) throw new Error("This NWC wallet does not support making invoices");

    // get the total amount of the proofs
    const totalAvailable = proofs.reduce((acc, proof) => acc + proof.amount, 0);
    let sweepAmount = totalAvailable;

    while (sweepAmount > 0) {
        const invoice = await this.makeInvoice(sweepAmount * 1000, "Nutzap redemption");

        const meltQuote = await cashuWallet.createMeltQuoteBolt11(invoice.invoice);
        const totalRequired = meltQuote.amount + meltQuote.fee_reserve;

        if (totalRequired > totalAvailable) {
            sweepAmount -= meltQuote.fee_reserve;
            continue;
        }

        const result = await cashuWallet.meltProofsBolt11(meltQuote, proofs, { privkey });
        let change: NDKCashuToken | undefined;
        if (result.change.length > 0) change = await saveChange(this.ndk, mint, result.change);

        const description = `Nutzap redemption to external wallet (${this.walletId})`;

        createOutTxEvent(
            this.ndk,
            {
                pr: invoice.invoice,
                paymentDescription: description,
            },
            {
                result: { preimage: invoice.preimage },
                mint: mint,
                fee: meltQuote.fee_reserve,
                proofsChange: { store: change?.proofs, mint },
                stateUpdate: {
                    created: change,
                },
            },
            this.relaySet,
            { nutzaps },
        );

        return sweepAmount;
    }

    throw new Error("Failed to redeem nutzaps");
}

async function saveChange(ndk: NDK, mint: string, change: Proof[]): Promise<NDKCashuToken | undefined> {
    const totalChange = change.reduce((acc, proof) => acc + proof.amount, 0);
    if (totalChange === 0) return;

    const token = new NDKCashuToken(ndk);
    token.mint = mint;
    token.proofs = change;
    token.publish();

    return token;
}
