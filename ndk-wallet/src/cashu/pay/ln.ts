import { CashuWallet, CashuMint } from "@cashu/cashu-ts";
import { LnPaymentInfo } from "@nostr-dev-kit/ndk";
import { NDKCashuPay } from "../pay";
import { TokenSelection, rollOverProofs, chooseProofsForPr } from "../proofs";
import { MintUrl } from "../mint/utils";



/**
 * 
 * @param useMint Forces the payment to use a specific mint
 * @returns 
 */
export async function payLn(
    this: NDKCashuPay,
    useMint?: MintUrl,
): Promise<string | undefined> {
    const mintBalances = this.wallet.mintBalances;
    let selections: TokenSelection[] = [];
    const amount = this.getAmount();
    const data = this.info as LnPaymentInfo;
    if (!data.pr) throw new Error("missing pr");

    let processingSelections = false;
    const processSelections = async (resolve: (value: string) => void, reject: () => void) => {
        processingSelections = true;
        for (const selection of selections) {
            const _wallet = new CashuWallet(new CashuMint(selection.mint));
            this.debug("paying %d sats with proofs %o", selection.quote!.amount, selection.usedProofs);
            try {
                const result = await _wallet.payLnInvoice(data.pr, selection.usedProofs, selection.quote);
                this.debug("payment result: %o", result);

                if (result.isPaid && result.preimage) {
                    this.debug("payment successful");
                    rollOverProofs(selection, result.change, selection.mint, this.wallet);
                    resolve(result.preimage);
                }
            } catch (e) {
                this.debug("failed to pay with mint %s", e.message);
                if (e?.message.match(/already spent/i)) {
                    this.debug("proofs already spent, rolling over");
                    rollOverProofs(selection, [], selection.mint, this.wallet);
                }
            }
        }
        
        processingSelections = false;
    }

    return new Promise<string>((resolve, reject) => {
        for (const [ mint, balance ] of Object.entries(mintBalances)) {
            if (useMint && mint !== useMint) continue;
            
            if (balance < amount) {
                this.debug("mint %s has insufficient balance %d", mint, balance, amount);

                if (useMint) {
                    reject(`insufficient balance in mint ${mint} (${balance} < ${amount})`);
                    return;
                }
                
                continue;
            }

            chooseProofsForPr(data.pr, mint, this.wallet).then(async (result) => {
                if (result) {
                    this.debug("successfully chose proofs for mint %s", mint);
                    selections.push(result);
                    if (!processingSelections) {
                        this.debug("processing selections");
                        await processSelections(resolve, reject);
                    }
                }
            })
        }
    });
}