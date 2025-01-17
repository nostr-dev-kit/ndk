import { LnPaymentInfo, CashuPaymentInfo, NDKUser, NDKNutzap, NDKPaymentConfirmationLN } from "@nostr-dev-kit/ndk";
import { NDKCashuWallet } from ".";
import { getBolt11Amount, getBolt11Description } from "../../../utils/ln";
import { NDKWalletChange } from "../history";
import { PaymentWithOptionalZapInfo } from "./payment";
import { Proof } from "@cashu/cashu-ts";
import { MintUrl } from "../mint/utils";
import { proofsTotalBalance } from "../token";
import { TokenCreationResult } from "../pay/nut";
import { WalletOperation } from "./effect";
import { UpdateStateResult } from "./state/update";

export async function createOutTxEvent(
    wallet: NDKCashuWallet,
    paymentRequest: PaymentWithOptionalZapInfo<LnPaymentInfo | CashuPaymentInfo>,
    paymentResult: WalletOperation<NDKPaymentConfirmationLN | TokenCreationResult>,
): Promise<NDKWalletChange> {
    let description: string | undefined = paymentRequest.paymentDescription;
    let amount: number | undefined;
    let unit: string | undefined;

    if ((paymentRequest as LnPaymentInfo).pr) {
        amount = getBolt11Amount((paymentRequest as LnPaymentInfo).pr);
        unit = "msat";
        description ??= getBolt11Description((paymentRequest as LnPaymentInfo).pr);
    } else {
        amount = paymentRequest.amount;
        unit = paymentRequest.unit || wallet.unit;
    }

    if (!amount) {
        console.error("BUG: Unable to find amount for paymentRequest", paymentRequest);
    }

    const historyEvent = new NDKWalletChange(wallet.ndk);
    
    if (wallet.event) historyEvent.tags.push(wallet.event.tagReference());
    historyEvent.direction = "out";
    historyEvent.amount = amount ?? 0;
    historyEvent.unit = unit;
    historyEvent.mint = paymentResult.mint;
    historyEvent.description = description;
    if (paymentResult.fee) historyEvent.fee = paymentResult.fee;
    if (paymentRequest.target) {
        // tag the target if there is one
        historyEvent.tags.push(paymentRequest.target.tagReference());
        
        if (!(paymentRequest.target instanceof NDKUser)) {
            historyEvent.tags.push(["p", paymentRequest.target.pubkey]);
        }
    }

    if (paymentResult.stateUpdate?.created) historyEvent.createdTokens = [paymentResult.stateUpdate.created];
    if (paymentResult.stateUpdate?.deleted) historyEvent.destroyedTokenIds = paymentResult.stateUpdate.deleted;
    if (paymentResult.stateUpdate?.reserved) historyEvent.reservedTokens = [paymentResult.stateUpdate.reserved];

    await historyEvent.sign();
    historyEvent.publish(wallet.relaySet);

    return historyEvent;
}

export async function createInTxEvent(
    wallet: NDKCashuWallet,
    proofs: Proof[],
    unit: string,
    mint: MintUrl,
    updateStateResult: UpdateStateResult,
    { nutzap, fee, description }: { nutzap?: NDKNutzap, fee?: number, description?: string },
): Promise<NDKWalletChange> {
    const historyEvent = new NDKWalletChange(wallet.ndk);

    const amount = proofsTotalBalance(proofs);
    
    if (wallet.event) historyEvent.tags.push(wallet.event.tagReference());
    historyEvent.direction = "in";
    historyEvent.amount = amount;
    historyEvent.unit = wallet.unit;
    historyEvent.mint = mint;
    historyEvent.description = description;

    if (nutzap) historyEvent.description ??= "redeemed nutzap";

    if (updateStateResult.created) historyEvent.createdTokens = [updateStateResult.created];
    if (updateStateResult.deleted) historyEvent.destroyedTokenIds = updateStateResult.deleted;
    if (updateStateResult.reserved) historyEvent.reservedTokens = [updateStateResult.reserved];

    if (nutzap) historyEvent.addRedeemedNutzap(nutzap);
    if (fee) historyEvent.fee = fee;

    console.log("created history event", JSON.stringify(historyEvent.rawEvent(), null, 4));
    await historyEvent.sign();
    historyEvent.publish(wallet.relaySet);

    return historyEvent;
}