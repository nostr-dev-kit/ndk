import { Proof } from "@cashu/cashu-ts";
import { MintUrl } from "../mint/utils";
import { NDKCashuWallet } from "./index.js";
import { CashuWallet } from "@cashu/cashu-ts";
import { WalletProofChange } from "./state/index";
import { UpdateStateResult } from "./state/update";
import { calculateFee } from "./fee";

type WithProofReserveCb<T> = {
    result: T;
    change: Proof[];
};

/**
 * The result of performing an operation with the wallet state.
 *
 * This is a wrapper around the result of the operation that might include
 * results of a payment (`result`).
 *
 * The rest of the fields are used to update the wallet state and generate
 * tx events.
 */
export type WalletOperation<T> = {
    result?: T;
    proofsChange: WalletProofChange | null;
    stateUpdate: UpdateStateResult | null;
    mint: MintUrl;
    fee: number;
};

/**
 * This function is used to reserve proofs for a given mint.
 * It will reserve the proofs for the given mint, and then call the callback function.
 * If the callback function returns a result, the wallet state will be updated based on the result.
 * If the callback function returns null, the proofs will be unreserved.
 *
 * Use this function to wrap any function that might affect the wallet state.
 *
 * @param wallet
 * @param cashuWallet
 * @param mint
 * @param amountWithFees - The amount of proofs to gather including fees (include fees)
 * @param intendedAmount - The amount of proofs the payment originally was intended to gather (exclude fees)
 * @param cb
 * @returns
 */
export async function withProofReserve<T>(
    wallet: NDKCashuWallet,
    cashuWallet: CashuWallet | undefined,
    mint: MintUrl,
    amountWithFees: number,
    amountWithoutFees: number,
    cb: (proofsToUse: Proof[], allOurProofs: Proof[]) => Promise<WithProofReserveCb<T> | null>
): Promise<WalletOperation<T> | null> {
    cashuWallet ??= await wallet.getCashuWallet(mint);

    const availableMintProofs = wallet.state.getProofs({ mint, onlyAvailable: true });
    const proofs = cashuWallet.selectProofsToSend(availableMintProofs, amountWithFees);

    const fetchedAmount = proofs.send.reduce((a, b) => a + b.amount, 0);
    if (fetchedAmount < amountWithFees) return null;

    // reserve the proofs we'll be using
    wallet.state.reserveProofs(proofs.send, amountWithFees);
    let cbResult: WithProofReserveCb<T> | null = null;
    let proofsChange: WalletProofChange | null = null;
    let updateRes: UpdateStateResult | null = null;

    try {
        cbResult = await cb(proofs.send, availableMintProofs);

        if (!cbResult) return null;

        proofsChange = {
            mint,
            store: cbResult.change,
            destroy: proofs.send,
        };

        /**
         * Update the wallet state.
         */
        updateRes = await wallet.state.update(proofsChange);
    } catch (e: any) {
        wallet.state.unreserveProofs(proofs.send, amountWithFees, "available");
        throw e;
    }

    if (!cbResult) return null;

    return {
        result: cbResult.result,
        proofsChange,
        stateUpdate: updateRes,
        mint,
        fee: calculateFee(amountWithoutFees, proofs.send, cbResult.change),
    };
}
