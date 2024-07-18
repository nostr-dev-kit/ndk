import { CashuMint, CashuWallet, Proof } from "@cashu/cashu-ts";
import { MintUrl } from "../mint/utils";
import { findMintsInCommon, NDKCashuPay } from "../pay";
import { chooseProofsForAmount, rollOverProofs } from "../proofs";

export type NutPayment = { amount: number, unit: string, mints: MintUrl[], p2pk?: string };

export async function payNut(
    this: NDKCashuPay,
) {
    const data = this.info as NutPayment;
    if (!data.mints) throw new Error("missing mints");

    const recipientMints = data.mints;
    const senderMints = this.wallet.mints;

    const mintsInCommon = findMintsInCommon([ recipientMints, senderMints ]);

    this.debug("mints in common %o, recipient %o, sender %o", mintsInCommon, recipientMints, senderMints);

    if (mintsInCommon.length === 0) {
        this.debug("no mints in common between sender and recipient");
    } else {
        return await payNutWithMintBalance(this, mintsInCommon);
    }
}

async function payNutWithMintBalance(
    pay: NDKCashuPay,
    mints: string[]
): Promise<{ proofs: Proof[], mint: MintUrl } | undefined> {
    const { amount, p2pk }  = pay.info as NutPayment;

    const mintsWithEnoughBalance = mints.filter(mint => {
        pay.debug("checking mint %s, balance %d", mint, pay.wallet.mintBalances[mint]);
        return pay.wallet.mintBalances[mint] >= amount;
    });

    pay.debug("mints with enough balance %o", mintsWithEnoughBalance);

    if (mintsWithEnoughBalance.length === 0) {
        pay.debug("no mints with enough balance to satisfy amount %d", amount);
        throw new Error("insufficient balance");
    }

    for (const mint of mintsWithEnoughBalance) {
        const _wallet = new CashuWallet(new CashuMint(mint));
        const selection = chooseProofsForAmount(amount, mint, pay.wallet);

        if (!selection) {
            pay.debug("failed to find proofs for amount %d", amount);
            throw new Error("insufficient balance");
            continue;
        }

        try {
            const res = await _wallet.send(amount, selection.usedProofs, {
                pubkey: p2pk,
            });
            pay.debug("payment result: %o", res);

            rollOverProofs(selection, res.returnChange, mint, pay.wallet);

            return { proofs: res.send, mint };
        } catch (e: any) {
            pay.debug("failed to pay with mint %s using proofs %o: %s", mint, selection.usedProofs, e.message);
            rollOverProofs(selection, [], mint, pay.wallet);
            throw new Error("failed to pay with mint " + e?.message);
            return;
        }
    }

    pay.debug("failed to pay with any mint");
    throw new Error("failed to find a mint with enough balance");
}