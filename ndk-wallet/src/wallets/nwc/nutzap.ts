import { Proof } from "@cashu/cashu-ts";
import { CashuWallet } from "@cashu/cashu-ts";
import { NDKNWCWallet } from "./index.js";
import NDK, { NDKCashuToken, NDKNutzap } from "@nostr-dev-kit/ndk";
import { createOutTxEvent } from "../cashu/wallet/txs.js";

export async function redeemNutzaps(
    this: NDKNWCWallet,
    cashuWallet: CashuWallet,
    nutzaps: NDKNutzap[],
    proofs: Proof[],
    mint: string,
    privkey: string
): Promise<number> {
    console.log('redeeming nutzaps into an NWC wallet', proofs.length);

    const info = await this.getInfo();

    if (!info.methods.includes("make_invoice")) throw new Error("This NWC wallet does not support making invoices");
    
    // get the total amount of the proofs
    let totalAmount = proofs.reduce((acc, proof) => acc + proof.amount, 0);

    while (totalAmount > 0) {
        console.log('\ttotal amount to redeem', totalAmount);
        const invoice = await this.makeInvoice(totalAmount * 1000, "Nutzap redemption")
        console.log('received an invoice', invoice);

        const meltQuote = await cashuWallet.createMeltQuote(invoice.invoice);
        const totalRequired = meltQuote.amount + meltQuote.fee_reserve;
        console.log('\tpaying this invoice requires', totalRequired, meltQuote);

        if (totalRequired > totalAmount) {
            console.log('\tnot enough balance to pay this invoice, trying again');
            totalAmount -= meltQuote.fee_reserve;
            console.log('\tlowering amount by', meltQuote.fee_reserve, 'to', totalAmount);
            continue;
        }

        const result = await cashuWallet.meltProofs(meltQuote, proofs, { privkey });
        let change: NDKCashuToken | undefined;
        if (result.change.length > 0) change = await saveChange(this.ndk, mint, result.change);

        createOutTxEvent(this.ndk, { pr: invoice.invoice }, {
            result: { preimage: invoice.preimage },
            mint: mint,
            fee: meltQuote.fee_reserve,
            proofsChange: { store: change?.proofs, mint },
            stateUpdate: {
                created: change,
            },
        }, this.relaySet, { nutzaps });

        return totalAmount;
    }

    throw new Error("Failed to redeem nutzaps");
}

async function saveChange(ndk: NDK, mint: string, change: Proof[]): Promise<NDKCashuToken | undefined> {
    const totalChange = change.reduce((acc, proof) => acc + proof.amount, 0);
    if (totalChange === 0) return;
    console.log('[NWC] we have some change, save it as CashuTokens', totalChange);

    const token = new NDKCashuToken(ndk);
    token.mint = mint;
    token.proofs = change;
    token.publish();

    return token;
}