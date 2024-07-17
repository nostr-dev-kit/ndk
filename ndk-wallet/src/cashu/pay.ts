import { CashuMint, CashuWallet, MeltQuoteResponse, Proof, SendResponse } from "@cashu/cashu-ts";
import { NDKCashuWallet } from "./wallet";
import createDebug from "debug";
import { NDKCashuToken } from "./token";
import { LnPaymentInfo } from "@nostr-dev-kit/ndk";
import { MintUrl } from "./mint/utils";

const d = createDebug("ndk-wallet:cashu:pay");

type NutPayment = { amount: number, unit: string, mints: MintUrl[], p2pk?: string };

function correctP2pk(p2pk?: string) {
    if (p2pk) {
        if (p2pk.length === 64) {
            d("p2pk is compressed, converting to uncompressed");
            p2pk = `02${p2pk}`;
        } else {
            d("p2pk is uncompressed", p2pk.length);
        }
    }

    return p2pk;
}

export class NDKCashuPay {
    private wallet: NDKCashuWallet;
    private info: LnPaymentInfo | NutPayment;
    private type: "ln" | "nut" = "ln";
    
    constructor(
        wallet: NDKCashuWallet,
        info: LnPaymentInfo | NutPayment
    ) {
        this.wallet = wallet;

        if ((info as LnPaymentInfo).pr) {
            this.type = "ln";
            this.info = info as LnPaymentInfo;
        } else {
            this.type = "nut";
            this.info = info as NutPayment;
            if (this.info.unit === "msats") {
                this.info.unit = "sats";
                this.info.amount = this.info.amount / 1000;
                this.info.p2pk = correctP2pk(this.info.p2pk);
            }

            d("nut payment %o", this.info);
        }
    }

    private getAmount() {
        if (this.type === 'ln') {
            // stab
            return 1;
        } else {
            return (this.info as NutPayment).amount;
        }
    }

    public async pay() {
        if (this.type === 'ln') {
            await this.payLn();
        } else {
            return this.payNut();
        }
    }

    async payNut() {
        const data = this.info as NutPayment;
        if (!data.mints) throw new Error("missing mints");

        const recipientMints = data.mints;
        const senderMints = this.wallet.mints;

        const mintsInCommon = findMintsInCommon([ recipientMints, senderMints ]);

        d("mints in common %o, recipient %o, sender %o", mintsInCommon, recipientMints, senderMints);

        if (mintsInCommon.length === 0) {
            d("no mints in common between sender and recipient");
        } else {
            return this.payNutWithMintBalance(mintsInCommon);
        }
    }

    async payNutWithMintBalance(mints: string[]): Promise<{ proofs: Proof[], mint: MintUrl } | undefined> {
        const { amount, p2pk }  = this.info as NutPayment;

        const mintsWithEnoughBalance = mints.filter(mint => {
            d("checking mint %s, balance %d", mint, this.wallet.mintBalances[mint]);
            return this.wallet.mintBalances[mint] >= amount;
        });

        d("mints with enough balance %o", mintsWithEnoughBalance);

        if (mintsWithEnoughBalance.length === 0) {
            d("no mints with enough balance to satisfy amount %d", amount);
            return;
        }

        for (const mint of mintsWithEnoughBalance) {
            const _wallet = new CashuWallet(new CashuMint(mint));
            const selection = chooseProofsForAmount(amount, mint, this.wallet);

            if (!selection) {
                d("failed to find proofs for amount %d", amount);
                continue;
            }

            d("paying %d sats with proofs %o", amount, selection.usedProofs);
            
            try {
                const res = await _wallet.send(amount, selection.usedProofs, {
                    pubkey: p2pk,
                });
                d("payment result: %o", res);

                rollOverProofs(selection, res.returnChange, mint, this.wallet);

                return { proofs: res.send, mint };
            } catch (e) {
                d("failed to pay with mint %s using proofs %o", mint, selection.usedProofs);
                rollOverProofs(selection, [], mint, this.wallet);
                return;
            }
        }

        d("failed to pay with any mint");
    }

    async payLn(): Promise<string | undefined> {
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
                d("paying %d sats with proofs %o", selection.quote!.amount, selection.usedProofs);
                try {
                    const result = await _wallet.payLnInvoice(data.pr, selection.usedProofs, selection.quote);
                    d("payment result: %o", result);

                    if (result.isPaid && result.preimage) {
                        d("payment successful");
                        rollOverProofs(selection, result.change, selection.mint, this.wallet);
                        resolve(result.preimage);
                    }
                } catch (e) {
                    d("failed to pay with mint %s", e.message);
                    if (e?.message.match(/already spent/i)) {
                        d("proofs already spent, rolling over");
                        rollOverProofs(selection, [], selection.mint, this.wallet);
                    }
                }
            }
            
            processingSelections = false;
        }

        return new Promise<string>((resolve, reject) => {
            for (const [ mint, balance ] of Object.entries(mintBalances)) {
                if (balance < amount) {
                    d("mint %s has insufficient balance %d", mint, balance, amount);
                    continue;
                }

                chooseProofsForPr(data.pr, mint, this.wallet).then(async (result) => {
                    if (result) {
                        d("successfully chose proofs for mint %s", mint);
                        selections.push(result);
                        if (!processingSelections) {
                            d("processing selections");
                            await processSelections(resolve, reject);
                        }
                    }
                })
            }
        });
    }
}

/**
 * Gets a melt quote from a payment request for a mint and tries to get
 * proofs that satisfy the amount.
 * @param pr 
 * @param mint 
 * @param wallet 
 */
async function chooseProofsForPr(pr: string, mint: string, wallet: NDKCashuWallet): Promise<TokenSelection | undefined> {
    const _wallet = new CashuWallet(new CashuMint(mint));
    const quote = await _wallet.meltQuote(pr);
    return chooseProofsForQuote(quote, wallet, mint);
}

type TokenSelection = {
    usedProofs: Proof[];
    movedProofs: Proof[];
    usedTokens: NDKCashuToken[];
    quote?: MeltQuoteResponse;
    mint: string;
};

function chooseProofsForAmount(amount: number, mint: string, wallet: NDKCashuWallet): TokenSelection | undefined {
    const mintTokens = wallet.mintTokens[mint];
    let remaining = amount;
    const usedProofs: Proof[] = [];
    const movedProofs: Proof[] = [];
    const usedTokens: NDKCashuToken[] = [];

    if (!mintTokens) {
        d("unexpected missing array of tokens for mint %s", mint);
        return;
    }

    for (const token of mintTokens) {
        if (remaining <= 0) break;

        let tokenUsed = false;
        for (const proof of token.proofs) {
            if (remaining > 0) {
                usedProofs.push(proof);
                remaining -= proof.amount;
                d("%s adding proof for amount %d, with %d remaining of total required", mint, proof.amount, remaining, amount);
                tokenUsed = true;
            } else {
                movedProofs.push(proof);
            }
        }

        if (tokenUsed) {
            usedTokens.push(token);
        }
    }

    if (remaining > 0) {
        d("insufficient tokens to satisfy amount %d, mint %s had %d", amount, mint, amount - remaining);
        return;
    }

    d("%s mint, used %d proofs and %d tokens to satisfy amount %d", mint, usedProofs.length, usedTokens.length, amount);

    return { usedProofs, movedProofs, usedTokens, mint };
}

function chooseProofsForQuote(quote: MeltQuoteResponse, wallet: NDKCashuWallet, mint: string): TokenSelection | undefined {
    const amount = quote.amount + quote.fee_reserve;

    d("quote for mint %s is %o", mint, quote);

    const res = chooseProofsForAmount(amount, mint, wallet);
    if (!res) {
        d("failed to find proofs for amount %d", amount);
        return;
    }

    return { ...res, quote };
}

/**
 * Deletes and creates new events to reflect the new state of the proofs
 */
export async function rollOverProofs(
    proofs: TokenSelection,
    changes: Proof[],
    mint: string,
    wallet: NDKCashuWallet,
) {
    proofs.usedTokens.forEach(token => {
        d("deleting token %o", token.rawEvent());
        token.delete(undefined, false).then(deletion => {
            const walletTag = token.tagValue("a");
            if (walletTag) {
                deletion.tags.push(["a", walletTag])
            }
            console.log('deletion', deletion.rawEvent());
            deletion.publish(wallet.relaySet);
        });
    });

    const proofsToSave = proofs.movedProofs;
    for (const change of changes) {
        proofsToSave.push(change);
    }

    if (proofsToSave.length === 0) {
        d("no proofs to save %o", proofs);
        return;
    }

    const tokenEvent = new NDKCashuToken(wallet.ndk);
    tokenEvent.proofs = proofsToSave;
    tokenEvent.mint = mint;
    tokenEvent.wallet = wallet;
    tokenEvent.publish(wallet.relaySet);
    d('created new token event', tokenEvent.rawEvent());
}

/**
 * Finds mints in common in the intersection of the arrays of mints
 * @example
 * const user1Mints = ["mint1", "mint2"];
 * const user2Mints = ["mint2", "mint3"];
 * const user3Mints = ["mint1", "mint2"];
 * 
 * findMintsInCommon([user1Mints, user2Mints, user3Mints]);
 * 
 * // returns ["mint2"]
 */
function findMintsInCommon(mintCollections: string[][]) {
    const mintCounts = new Map<string, number>();

    for (const mints of mintCollections) {
        for (const mint of mints) {
            if (!mintCounts.has(mint)) {
                mintCounts.set(mint, 1);
            } else {
                mintCounts.set(mint, mintCounts.get(mint)! + 1);
            }
        }
    }

    const commonMints: string[] = [];
    for (const [ mint, count ] of mintCounts.entries()) {
        if (count === mintCollections.length) {
            commonMints.push(mint);
        }
    }

    return commonMints;
}