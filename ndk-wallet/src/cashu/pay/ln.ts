import { CashuWallet, CashuMint } from "@cashu/cashu-ts";
import type { LnPaymentInfo } from "@nostr-dev-kit/ndk";
import type { NDKCashuPay } from "../pay";
import type { TokenSelection} from "../proofs";
import { rollOverProofs, chooseProofsForPr } from "../proofs";
import type { MintUrl } from "../mint/utils";

/**
 *
 * @param useMint Forces the payment to use a specific mint
 * @returns
 */
export async function payLn(this: NDKCashuPay, useMint?: MintUrl): Promise<string | undefined> {
    const mintBalances = this.wallet.mintBalances;
    const selections: TokenSelection[] = [];
    let amount = this.getAmount();
    const data = this.info as LnPaymentInfo;
    if (!data.pr) throw new Error("missing pr");

    amount /= 1000; // convert msat to sat

    let paid = false;
    let processingSelections = false;
    const processSelections = async (resolve: (value: string) => void, reject: (err: string) => void) => {
        processingSelections = true;
        for (const selection of selections) {
            const _wallet = new CashuWallet(new CashuMint(selection.mint));
            this.debug(
                "paying LN invoice for %d sats (%d in fees) with proofs %o, %s",
                selection.quote!.amount,
                selection.quote!.fee_reserve,
                selection.usedProofs,
                data.pr
            );
            try {
                const result = await _wallet.payLnInvoice(
                    data.pr,
                    selection.usedProofs,
                    selection.quote
                );
                this.debug("payment result: %o", result);

                if (result.isPaid && result.preimage) {
                    this.debug("payment successful");
                    rollOverProofs(selection, result.change, selection.mint, this.wallet);
                    paid = true;
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

        if (!paid) {
            reject("failed to pay with any mint");
        }

        processingSelections = false;
    };

    return new Promise<string>((resolve, reject) => {
        let foundMint = false;

        for (const [mint, balance] of Object.entries(mintBalances)) {
            if (useMint && mint !== useMint) continue;

            if (balance < amount) {
                this.debug("mint %s has insufficient balance %d", mint, balance, amount);

                if (useMint) {
                    reject(`insufficient balance in mint ${mint} (${balance} < ${amount})`);
                    return;
                }

                continue;
            }

            foundMint = true;

            chooseProofsForPr(data.pr, mint, this.wallet).then(async (result) => {
                if (result) {
                    this.debug("successfully chose proofs for mint %s", mint);
                    selections.push(result);
                    if (!processingSelections) {
                        this.debug("processing selections");
                        await processSelections(resolve, reject);
                    }
                }
            });
        }

        this.debug({foundMint})

        if (!foundMint) {
            this.wallet.emit("insufficient_balance", {amount, pr: data.pr});
            
            this.debug("no mint with sufficient balance found");
            reject("no mint with sufficient balance found");
        }
    });
}
