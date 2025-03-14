import NDK, {
    LnPaymentInfo,
    CashuPaymentInfo,
    NDKUser,
    NDKNutzap,
    NDKPaymentConfirmationLN,
    proofsTotalBalance,
    NDKCashuWalletTx,
    NDKRelaySet,
} from "@nostr-dev-kit/ndk";
import { getBolt11Amount, getBolt11Description } from "../../../utils/ln";
import { PaymentWithOptionalZapInfo } from "./payment";
import { Proof } from "@cashu/cashu-ts";
import { MintUrl } from "../mint/utils";
import { TokenCreationResult } from "../pay/nut";
import { WalletOperation } from "./effect";
import { UpdateStateResult } from "./state/update";

/**
 * Creates a tx event for outgoing payment, this means we are spending cashu proofs.
 *
 * Nutzaps are only here to indicate that we have redeemed nutzaps and spent them into a non-NIP-60 wallet,
 * like when redeeming nutzaps into an NWC wallet.
 */
export async function createOutTxEvent(
    ndk: NDK,
    paymentRequest: PaymentWithOptionalZapInfo<LnPaymentInfo | CashuPaymentInfo>,
    paymentResult: WalletOperation<NDKPaymentConfirmationLN | TokenCreationResult>,
    relaySet?: NDKRelaySet,
    { nutzaps }: { nutzaps?: NDKNutzap[] } = {}
): Promise<NDKCashuWalletTx> {
    let description: string | undefined = paymentRequest.paymentDescription;
    let amount: number | undefined;

    if ((paymentRequest as LnPaymentInfo).pr) {
        amount = getBolt11Amount((paymentRequest as LnPaymentInfo).pr);
        description ??= getBolt11Description((paymentRequest as LnPaymentInfo).pr);

        if (amount) amount /= 1000; // convert to sats
    } else {
        amount = paymentRequest.amount;
    }

    if (!amount) {
        console.error("BUG: Unable to find amount for paymentRequest", paymentRequest);
    }

    const txEvent = new NDKCashuWalletTx(ndk);

    txEvent.direction = "out";
    txEvent.amount = amount ?? 0;
    txEvent.mint = paymentResult.mint;
    txEvent.description = description;
    if (paymentResult.fee) txEvent.fee = paymentResult.fee;
    if (paymentRequest.target) {
        // tag the target if there is one
        txEvent.tags.push(paymentRequest.target.tagReference());

        if (!(paymentRequest.target instanceof NDKUser)) {
            txEvent.tags.push(["p", paymentRequest.target.pubkey]);
        }
    }

    if (nutzaps) {
        txEvent.description ??= "nutzap redeem";
        for (const nutzap of nutzaps) txEvent.addRedeemedNutzap(nutzap);
    }

    if (paymentResult.stateUpdate?.created)
        txEvent.createdTokens = [paymentResult.stateUpdate.created];
    if (paymentResult.stateUpdate?.deleted)
        txEvent.destroyedTokenIds = paymentResult.stateUpdate.deleted;
    if (paymentResult.stateUpdate?.reserved)
        txEvent.reservedTokens = [paymentResult.stateUpdate.reserved];

    await txEvent.sign();
    txEvent.publish(relaySet);

    return txEvent;
}

export async function createInTxEvent(
    ndk: NDK,
    proofs: Proof[],
    mint: MintUrl,
    updateStateResult: UpdateStateResult,
    { nutzaps, fee, description }: { nutzaps?: NDKNutzap[]; fee?: number; description?: string },
    relaySet?: NDKRelaySet
): Promise<NDKCashuWalletTx> {
    const txEvent = new NDKCashuWalletTx(ndk);

    const amount = proofsTotalBalance(proofs);

    txEvent.direction = "in";
    txEvent.amount = amount;
    txEvent.mint = mint;
    txEvent.description = description;

    if (updateStateResult.created) txEvent.createdTokens = [updateStateResult.created];
    if (updateStateResult.deleted) txEvent.destroyedTokenIds = updateStateResult.deleted;
    if (updateStateResult.reserved) txEvent.reservedTokens = [updateStateResult.reserved];

    if (nutzaps) for (const nutzap of nutzaps) txEvent.addRedeemedNutzap(nutzap);
    if (fee) txEvent.fee = fee;

    await txEvent.sign();
    txEvent.publish(relaySet);

    return txEvent;
}
