import { CashuWallet, CashuMint, Proof, MeltQuoteState } from "@cashu/cashu-ts";
import type { LnPaymentInfo } from "@nostr-dev-kit/ndk";
import type { NDKCashuPay } from "../pay";
import type { TokenSelection } from "../proofs";
import { rollOverProofs, chooseProofsForPr } from "../proofs";
import type { MintUrl } from "../mint/utils";
import { NDKCashuWallet } from "../wallet";
import { NDKWalletChange } from "../history";

export async function payLn(this: NDKCashuPay, useMint?: MintUrl): Promise<string | undefined> {
    const mintBalances = this.wallet.mintBalances;
    const amount = this.getAmount() / 1000; // convert msat to sat
    const data = this.info as LnPaymentInfo;
    if (!data.pr) throw new Error("missing pr");

    return new Promise<string>((resolve, reject) => {
        const eligibleMints = getEligibleMints(mintBalances, amount, useMint, this.debug);

        if (eligibleMints.length === 0) {
            handleInsufficientBalance(amount, data.pr, this.wallet, this.debug, reject);
            return;
        }

        attemptPaymentWithEligibleMints(
            eligibleMints,
            data.pr,
            amount,
            this.wallet,
            this.debug,
            resolve,
            reject
        );
    });
}

function getEligibleMints(
    mintBalances: Record<string, number>,
    amount: number,
    useMint: MintUrl | undefined,
    debug: NDKCashuPay["debug"]
): string[] {
    return Object.entries(mintBalances)
        .filter(([mint, balance]) => {
            if (useMint && mint !== useMint) return false;
            if (balance < amount) {
                debug("mint %s has insufficient balance %d", mint, balance, amount);
                return false;
            }
            return true;
        })
        .map(([mint]) => mint);
}

function handleInsufficientBalance(
    amount: number,
    pr: string,
    wallet: NDKCashuPay["wallet"],
    debug: NDKCashuPay["debug"],
    reject: (reason: string) => void
): void {
    wallet.emit("insufficient_balance", { amount, pr });
    debug("no mint with sufficient balance found");
    reject("no mint with sufficient balance found");
}

async function attemptPaymentWithEligibleMints(
    eligibleMints: string[],
    pr: string,
    amount: number,
    wallet: NDKCashuPay["wallet"],
    debug: NDKCashuPay["debug"],
    resolve: (value: string) => void,
    reject: (reason: string) => void
): Promise<void> {
    const TIMEOUT = 10000; // 10 seconds timeout
    const selections: TokenSelection[] = [];

    const selectionPromises = eligibleMints.map((mint) =>
        chooseProofsForPr(pr, mint, wallet)
            .then((result) => {
                if (result) {
                    debug("Successfully chose proofs for mint %s", mint);
                    selections.push(result);
                }
                return result;
            })
            .catch((error) => {
                debug("Error choosing proofs for mint %s: %s", mint, error);
                return null;
            })
    );

    try {
        await Promise.race([
            Promise.all(selectionPromises),
            new Promise((_, timeoutReject) =>
                setTimeout(() => timeoutReject(new Error("Timeout")), TIMEOUT)
            ),
        ]);
    } catch (error) {
        debug("Timed out while choosing proofs: %s", error);
    }

    if (selections.length === 0) {
        reject("Failed to choose proofs for any mint");
        return;
    }

    // Sort selections by fee reserve (lower is better)
    selections.sort((a, b) => (a.quote?.fee_reserve ?? 0) - (b.quote?.fee_reserve ?? 0));

    for (const selection of selections) {
        try {
            const result = await executePayment(selection, pr, wallet, debug);
            if (result) {
                resolve(result);
                return;
            }
        } catch (error) {
            debug("Failed to execute payment for mint %s: %s", selection.mint, error);
        }
    }

    reject("Failed to pay with any mint");
}

/**
 * Attempts to pay using a selected set of Cashu tokens.
 *
 * @param selection - The TokenSelection object containing the chosen proofs and quote for the payment.
 * @param pr - The Lightning Network payment request (invoice) to pay.
 * @param wallet - The NDKCashuPay wallet instance.
 * @param debug - The debug function for logging.
 * @returns A Promise that resolves to the payment preimage as a string if successful, or null if the payment fails.
 *
 * @throws Will throw an error if the payment fails due to network issues or other problems.
 *
 * This function performs the following steps:
 * 1. Creates a new CashuWallet instance for the specific mint.
 * 2. Attempts to pay the Lightning invoice using the selected proofs.
 * 3. If successful, it rolls over any change proofs.
 * 4. If the proofs are already spent, it rolls over the selection without change.
 * 5. Logs the process and any errors for debugging purposes.
 */
async function executePayment(
    selection: TokenSelection,
    pr: string,
    wallet: NDKCashuWallet,
    debug: NDKCashuPay["debug"]
): Promise<string | null> {
    const _wallet = await wallet.walletForMint(selection.mint);

    if (!selection.quote) throw new Error("No quote provided")
    
    debug(
        "Attempting LN payment for %d sats (%d in fees) with proofs %o, %s",
        selection.quote.amount,
        selection.quote.fee_reserve,
        selection.usedProofs,
        pr
    );

    try {
        const meltQuote = await _wallet.createMeltQuote(pr);
        const amountToSend = meltQuote.amount + meltQuote.fee_reserve;

        const allMintProofs = wallet.proofsForMint(selection.mint);
        
        const result = await _wallet.send(
            amountToSend,
            allMintProofs,
            { includeFees: true }
        );
        debug("Send result: %o", result);

        const meltResult = await _wallet.meltProofs(meltQuote, result.keep);
        debug("Melt result: %o", meltResult);

        const fee = calculateFee(selection.quote.amount, allMintProofs, meltResult.change);

        function calculateFee(sentAmount: number, proofs: Proof[], change: Proof[]) {
            let fee = -sentAmount;
            for (const proof of proofs) fee += proof.amount;
            for (const proof of change) fee -= proof.amount;
            return fee;
        }

        // generate history event
        if (meltResult.quote.state === MeltQuoteState.PAID && meltResult.quote.payment_preimage) {
            debug("Payment successful");
            const { destroyedTokens, createdToken } = await rollOverProofs(
                selection,
                [
                    ...result.keep,
                    ...meltResult.change
                ],
                selection.mint, wallet);
            const historyEvent = new NDKWalletChange(wallet.ndk);
            historyEvent.destroyedTokens = destroyedTokens;
            if (createdToken) historyEvent.createdTokens = [createdToken];
            historyEvent.tag(wallet.event);
            historyEvent.direction = 'out';
            historyEvent.description = 'Lightning payment';
            historyEvent.tags.push(['preimage', meltResult.quote.payment_preimage]);
            historyEvent.amount = selection.quote.amount;
            historyEvent.fee = fee;
            historyEvent.publish(wallet.relaySet);

            return meltResult.quote.payment_preimage;
        }
    } catch (e) {
        debug("Failed to pay with mint %s", e.message);
        if (e?.message.match(/already spent/i)) {
            debug("Proofs already spent, rolling over");
            rollOverProofs(selection, [], selection.mint, wallet);
        }
        throw e;
    }

    return null;
}
