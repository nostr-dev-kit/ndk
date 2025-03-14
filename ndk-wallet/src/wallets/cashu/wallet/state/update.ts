import {
    NDKEvent,
    NDKEventId,
    NDKKind,
    NDKRelay,
    NDKRelaySet,
    NostrEvent,
    NDKCashuToken,
} from "@nostr-dev-kit/ndk";
import { JournalEntry, ProofC, WalletState, WalletTokenChange } from ".";
import { WalletProofChange } from "./index.js";
import { Proof } from "@cashu/cashu-ts";
import { MintUrl } from "../../mint/utils";

export type UpdateStateResult = {
    /**
     * Tokens that were created as the result of a state change
     */
    created?: NDKCashuToken;
    /**
     * Tokens that were reserved as the result of a state change
     */
    reserved?: NDKCashuToken;
    /**
     * Tokens that were deleted as the result of a state change
     */
    deleted?: NDKEventId[];
};

/**
 *
 * @param this
 * @param stateChange
 */
export async function update(
    this: WalletState,
    stateChange: WalletProofChange,
    memo?: string
): Promise<UpdateStateResult> {
    updateInternalState(this, stateChange);
    this.wallet.emit("balance_updated");

    return updateExternalState(this, stateChange);
}

/**
 * This function immediately reflects a state update
 */
function updateInternalState(walletState: WalletState, stateChange: WalletProofChange) {
    if (stateChange.store && stateChange.store.length > 0) {
        for (const proof of stateChange.store) {
            walletState.addProof({
                mint: stateChange.mint,
                state: "available",
                proof,
                timestamp: Date.now(),
            });
        }
    }

    if (stateChange.destroy && stateChange.destroy.length > 0) {
        for (const proof of stateChange.destroy) {
            walletState.updateProof(proof, { state: "deleted" });
        }
    }

    if (stateChange.reserve && stateChange.reserve.length > 0) {
        throw new Error("BUG: Proofs should not be reserved via update");
    }
}

/**
 * This function updates tokens on relays.
 */
async function updateExternalState(
    walletState: WalletState,
    stateChange: WalletProofChange
): Promise<UpdateStateResult> {
    const newState = calculateNewState(walletState, stateChange);

    if (newState.deletedTokenIds.size > 0) {
        const deleteEvent = new NDKEvent(walletState.wallet.ndk, {
            kind: NDKKind.EventDeletion,
            tags: [
                ["k", NDKKind.CashuToken.toString()],
                ...Array.from(newState.deletedTokenIds).map((id) => ["e", id]),
            ],
        } as NostrEvent);
        await deleteEvent.sign();
        publishWithRetry(walletState, deleteEvent, walletState.wallet.relaySet);

        // remove the tokens from the wallet
        for (const tokenId of newState.deletedTokenIds) {
            walletState.removeTokenId(tokenId);
        }
    }

    // execute the state change
    const res: UpdateStateResult = {};
    if (newState.saveProofs.length > 0) {
        const newToken = await createTokenEvent(walletState, stateChange.mint, newState);
        res.created = newToken;
    }

    return res;
}

/**
 * Publishes an event to a relay set, retrying if necessary.
 * @param event
 * @param relaySet
 */
async function publishWithRetry(
    walletState: WalletState,
    event: NDKEvent,
    relaySet?: NDKRelaySet,
    retryTimeout = 10 * 1000 // 10 seconds
) {
    let publishResult: Set<NDKRelay> | undefined;
    publishResult = await event.publish(relaySet);

    let type: string | undefined;
    if (event.kind === NDKKind.EventDeletion) type = "deletion";
    if (event.kind === NDKKind.CashuToken) type = "token";
    if (event.kind === NDKKind.CashuWallet) type = "wallet";

    const journalEntryMetadata: JournalEntry["metadata"] = {
        type,
        id: event.id,
        relayUrl: relaySet?.relayUrls.join(","),
    };

    if (publishResult) {
        walletState.journal.push({
            memo: "Publish kind:" + event.kind + " succeesfully",
            timestamp: Date.now(),
            metadata: journalEntryMetadata,
        });

        return publishResult;
    }

    walletState.journal.push({
        memo: "Publish failed",
        timestamp: Date.now(),
        metadata: journalEntryMetadata,
    });

    setTimeout(() => {
        publishWithRetry(walletState, event, relaySet, retryTimeout);
    }, retryTimeout);
}

/**
 * Creates a token event as part of a state transition.
 */
async function createTokenEvent(
    walletState: WalletState,
    mint: MintUrl,
    newState: WalletTokenChange
) {
    const newToken = new NDKCashuToken(walletState.wallet.ndk);
    newToken.mint = mint;
    newToken.proofs = newState.saveProofs;

    // create the event id
    await newToken.toNostrEvent();

    // immediately add the token to the wallet before signing it
    walletState.addToken(newToken);

    // add the deleted tokens to the new token
    newToken.deletedTokens = Array.from(newState.deletedTokenIds);

    // sign it
    await newToken.sign();

    // update the token in place, no need to affect proofs since they already have the right token id
    walletState.addToken(newToken);

    // publish it
    publishWithRetry(walletState, newToken, walletState.wallet.relaySet);

    return newToken;
}

export function calculateNewState(
    walletState: WalletState,
    stateChange: WalletProofChange
): WalletTokenChange {
    /**
     * This tracks the proofs that we know we need to destroy.
     */
    const destroyProofs = new Set<ProofC>();
    for (const proof of stateChange.destroy || []) destroyProofs.add(proof.C);

    /**
     * This tracks the proofs that we need to store.
     */
    const proofsToStore = new Map<ProofC, Proof>();

    /**
     * This tracks the tokens that we need to delete.
     */
    let tokensToDelete: Map<NDKEventId, NDKCashuToken>;

    // add all proofs from stateChange.store to proofsToStore
    for (const proof of stateChange.store || []) proofsToStore.set(proof.C, proof);

    // get tokens where proofs to be deleted are stored
    tokensToDelete = getAffectedTokens(walletState, stateChange);

    // get proofs from tokens that are not deleted that we need to store
    for (const token of tokensToDelete.values()) {
        for (const proof of token.proofs) {
            if (destroyProofs.has(proof.C)) continue;
            proofsToStore.set(proof.C, proof);
        }
    }

    return {
        deletedTokenIds: new Set(tokensToDelete.keys()),
        deletedProofs: destroyProofs,
        reserveProofs: [],
        saveProofs: Array.from(proofsToStore.values()),
    };
}

function getAffectedTokens(walletState: WalletState, stateChange: WalletProofChange) {
    const tokens = new Map<NDKEventId, NDKCashuToken>();

    for (const proof of stateChange.destroy || []) {
        const proofEntry = walletState.proofs.get(proof.C);
        if (!proofEntry) {
            console.log("BUG! Unable to find proof entry from known proof's C", proof.C);
            continue;
        }

        const tokenId = proofEntry.tokenId;
        if (!tokenId) {
            console.log("BUG! Proof entry for known proof's C", proof.C, "has no token id");
            continue;
        }

        const tokenEntry = walletState.tokens.get(tokenId);
        if (!tokenEntry?.token) {
            console.log(
                "BUG! Unable to find token from known token id",
                tokenId,
                "for proof",
                proof.C
            );
            continue;
        }

        tokens.set(tokenId, tokenEntry.token);
    }

    return tokens;
}
