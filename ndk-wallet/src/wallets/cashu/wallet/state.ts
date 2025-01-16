import { NDKEvent, NDKEventId, NDKKind, normalizeUrl, NostrEvent } from "@nostr-dev-kit/ndk";
import { NDKCashuToken } from "../token";
import { CashuWallet, Proof } from "@cashu/cashu-ts";
import { MintUrl } from "../mint/utils";
import { NDKCashuWallet } from ".";
import { calculateFee } from "./fee";

export type UpdateStateResult = {
    /**
     * Tokens that were created as the result of a state change
     */
    created?: NDKCashuToken,
    /**
     * Tokens that were reserved as the result of a state change
     */
    reserved?: NDKCashuToken,
    /**
     * Tokens that were deleted as the result of a state change
     */
    deleted?: NDKEventId[],
}

/**
 * A description of the changes that need to be made to the wallet state
 * to reflect changes that have occurred.
 */
export type WalletProofChange = {
    // reserve proofs are moved into an NDKKind.CashuReserve event until we verify that the recipient has received them
    reserve?: Proof[],

    // destroy proofs are deleted from the wallet
    destroy?: Proof[],

    // store proofs are added to the wallet
    store?: Proof[],
    mint: MintUrl,
}

/**
 * A description of tokens that need to be changed to reflect the changes that have occurred.
 */
export type WalletTokenChange = {
    // token ids that are to be deleted
    deletedTokenIds: Set<string>;

    // these are the Cs of the proofs that are getting deleted
    deletedProofs: Set<string>;

    // proofs that are to be moved to a reserve
    reserveProofs: Proof[];

    // proofs that are to be added to the wallet in a new token
    saveProofs: Proof[];
}

/**
 * This class represents the state of the wallet at any given time.
 * It uses information coming from relays, as well as optimistic assumptions
 * about the changing state of the wallet.
 */
export class WalletState {
    /**
     * the amounts that are intended to be reserved
     * this is the net amount we are trying to pay out,
     * excluding fees and coin sizes
     * e.g. we might want to pay 5 sats, have 2 sats in fees
     * and we're using 2 inputs that add up to 8, the reserve amount is 5
     * while the reserve proofs add up to 8
     */
    public reserveAmounts: number[] = [];

    constructor(
        private wallet: NDKCashuWallet,
        public tokens: NDKCashuToken[] = [],
        public knownTokens = new Set<NDKEventId>(),
        public reservedProofCs: Set<string> = new Set<string>(),
    ) {}

    /**
     * Returns a map of the proof C values to the token where it was found
     */
    getAllMintProofTokens(mint?: MintUrl): Map<string, NDKCashuToken> {
        const allMintProofs = new Map<string, NDKCashuToken>();

        this.tokens
            .filter((t) => mint ? t.mint === mint : true)
            .forEach((t) => {
                t.proofs.forEach((p) => {
                    allMintProofs.set(p.C, t);
                });
            });

        return allMintProofs;
    }

    /**
     * Reserves proofs so we don't try to use them.
     * 
     * @param proofs 
     */
    reserveProofs(proofs: Proof[], amount: number) {
        for (const proof of proofs) {
            this.reservedProofCs.add(proof.C);
        }

        this.reserveAmounts.push(amount);

        this.wallet.emit("balance_updated");
    }

    /**
     * Unreserves proofs so we can use them again.
     * 
     * @param proofs 
     */
    unreserveProofs(proofs: Proof[], amount: number) {
        for (const proof of proofs) {
            this.reservedProofCs.delete(proof.C);
        }

        // find one that matches the amount and remove it
        const index = this.reserveAmounts.indexOf(amount);
        if (index !== -1) {
            this.reserveAmounts.splice(index, 1);
        }

        this.wallet.emit("balance_updated");
        console.log("balance_updated", { reserveAmounts: this.reserveAmounts });
    }

    /**
     * Returns all proofs for a given mint
     * 
     * @param mint 
     * @param includeReserved - Whether to include proofs that are reserved -- when showing a balance we want to include reserved proofs, but when gathering proofs for a payment we want to exclude reserved proofs
     */
    proofsForMint(
        mint: MintUrl,
        includeReserved: boolean = false
    ): Proof[] {
        mint = normalizeUrl(mint);

        const filterOutProofs = includeReserved ? () => true : (proof: Proof) => !this.reservedProofCs.has(proof.C);

        return this.tokens
            .filter((t) => t.mint === mint)
            .map((t) => t.proofs)
            .flat()
            .filter(filterOutProofs);
    }


    /**
     * Updates the internal state to add a token,
     * there is no change published anywhere when calling this function.
     */
    addToken(token: NDKCashuToken): boolean {
        // check for proofs we already have
        if (!token.mint) throw new Error("token " + token.encode() + " has no mint");

        // double check we don't already have this token
        if (this.knownTokens.has(token.id)) {
            return false;
        }

        const allMintProofs = this.getAllMintProofTokens(token.mint);

        for (const proof of token.proofs) {
            if (allMintProofs.has(proof.C)) {
                const collidingToken = allMintProofs.get(proof.C);

                if (!collidingToken) {
                    console.trace("BUG: unable to find colliding token", {
                        token: token.id,
                        proof: proof.C,
                    });
                    throw new Error("BUG: unable to find colliding token");
                }

                // keep newer token, remove old
                if (token.created_at! <= collidingToken.created_at!) {
                    // we don't have to do anything
                    this.wallet.warn("Received an older token with proofs that were already known, this is likely a relay that didn't receive (or respected) a delete event", token);
                    
                    return false; 
                }

                // remove old token
                this.removeTokenId(collidingToken.id);
            }
        } 
        
        if (!this.knownTokens.has(token.id)) {
            this.knownTokens.add(token.id);
            this.tokens.push(token);
            this.wallet.emit("balance_updated");
        }

        return true;
    }

    /**
     * Removes a token that has been deleted
     */
    removeTokenId(id: NDKEventId) {
        if (!this.knownTokens.has(id)) {
            return false;
        }

        this.tokens = this.tokens.filter((t) => t.id !== id);
        this.wallet.emit("balance_updated");
    }

    /**
     * Calculates the new state of the wallet based on a given change.
     * 
     * This method processes the proofs to be stored, identifies proofs to be deleted,
     * and determines which tokens are affected by the change. It updates the wallet
     * state by:
     * - Collecting all proofs that are part of the new state.
     * - Identifying all proofs that are affected by the change.
     * - Removing proofs that are to be kept from the affected proofs.
     * - Identifying proofs that should be deleted.
     * - Processing affected tokens to determine which proofs need to be saved.
     * 
     * @param change The change to be applied to the wallet state.
     * @returns The new state of the wallet, including proofs to be saved, deleted, or reserved.
     */
    public async calculateNewState(change: WalletProofChange): Promise<WalletTokenChange> {
        const newState: WalletTokenChange = {
            deletedTokenIds: new Set<NDKEventId>(),
            deletedProofs: new Set<string>(),
            reserveProofs: [],
            saveProofs: [],
        };
        const { mint } = change;

        const proofCsToBeStored = new Set<string>();
        let proofCsToBeDeleted = new Set<string>();
        
        // Create a set of the proofs that will be destroyed
        if (change.destroy)
            proofCsToBeDeleted = new Set(
                change.destroy.map(proofToBeDestroyed => proofToBeDestroyed.C)
            )

        const allProofsInMint = new Set(this.proofsForMint(mint).map(proof => proof.C));

        // find all the new proofs we didn't know about that we need to save
        for (const proofToStore of (change.store||[])) {
            if (allProofsInMint.has(proofToStore.C)) continue;
            newState.saveProofs.push(proofToStore);
            proofCsToBeStored.add(proofToStore.C);
        }

        // find al the proofs that are to be destroyed
        newState.deletedProofs = new Set(change.destroy?.map(proof => proof.C));

        // find the tokens where those proofs are stored
        const proofsToTokenMap = this.getAllMintProofTokens(change.mint);
        for (const proofToDelete of newState.deletedProofs) {
            const token = proofsToTokenMap.get(proofToDelete)
            if (!token) {
                console.log("BUG! Unable to find token id from known proof's C", {
                    proofsToTokenKeys: proofsToTokenMap.keys(),
                    CToDelete: proofToDelete.substring(0, 10)
                })
                continue;
            }

            // add to the saveProofs all the proofs that were not deleted
            for (const proofInTokenToBeDeleted of token.proofs) {
                if (proofCsToBeDeleted.has(proofInTokenToBeDeleted.C)) continue;
                if (proofCsToBeStored.has(proofInTokenToBeDeleted.C)) continue;
                newState.saveProofs.push(proofInTokenToBeDeleted);
                proofCsToBeStored.add(proofInTokenToBeDeleted.C);
            }
            
            newState.deletedTokenIds.add(token.id)
        }

        return newState;
    }

    /**
     * Updates the wallet state based on a send result
     * @param sendResult 
     */
    public async update(change: WalletProofChange): Promise<UpdateStateResult> {
        const newState = await this.calculateNewState(change);
        const res: UpdateStateResult = {};

        // create the new token if we have to
        if (newState.saveProofs.length > 0) {
            const newToken = new NDKCashuToken(this.wallet.ndk);
            newToken.proofs = newState.saveProofs;
            newToken.mint = change.mint;
            newToken.wallet = this.wallet;
            await newToken.sign();
            newToken.publish(this.wallet.relaySet);
            res.created = newToken;

            // add the token to the wallet immediately
            this.addToken(newToken);
        }

        // delete the tokens that are affected
        if (newState.deletedTokenIds.size > 0) {
            const deleteEvent = new NDKEvent(this.wallet.ndk, {
                kind: NDKKind.EventDeletion,
                tags: [
                    [ "k", NDKKind.CashuToken.toString() ],
                    ...Array.from(newState.deletedTokenIds).map((id) => ([ "e", id ])),
                ]
            } as NostrEvent);
            await deleteEvent.sign();
            deleteEvent.publish(this.wallet.relaySet);
            res.deleted = Array.from(newState.deletedTokenIds);

            // remove the tokens from the wallet
            for (const tokenId of newState.deletedTokenIds) {
                this.removeTokenId(tokenId);
            }
        }

        // create the reserve token if we have to
        if (newState.reserveProofs.length > 0) {
            const reserveToken = new NDKCashuToken(this.wallet.ndk);
            reserveToken.proofs = newState.reserveProofs;
            reserveToken.mint = change.mint;
            reserveToken.wallet = this.wallet;
            await reserveToken.sign();
            reserveToken.publish(this.wallet.relaySet);
            res.reserved = reserveToken;
        }

        return res;
    }

    /**
     * Returns the available balance for each mint, excluding reserved proofs
     */
    public getAvailableMintBalances(): Record<MintUrl, number> {
        const balances: Record<MintUrl, number> = {};

        // Get all proofs that are reserved
        const reservedProofCs = this.reservedProofCs;

        for (const token of this.tokens) {
            if (!token.mint) continue;
            
            balances[token.mint] ??= 0;
            
            // Only count proofs that aren't reserved
            const availableProofs = token.proofs.filter(p => !reservedProofCs.has(p.C));
            balances[token.mint] += availableProofs.reduce((sum, p) => sum + p.amount, 0);
        }

        return balances;
    }

    /**
     * Returns the total balance for each mint, including reserved proofs
     */
    get mintBalances(): Record<MintUrl, number> {
        const balances: Record<MintUrl, number> = {};

        for (const token of this.tokens) {
            if (token.mint) {
                balances[token.mint] ??= 0;
                balances[token.mint] += token.amount;
            }
        }

        return balances;
    }
}

type WithProofReserveCb<T> = {
    result: T,
    change: Proof[],
}

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
    result: T,
    proofsChange: WalletProofChange | null,
    stateUpdate: UpdateStateResult | null,
    mint: MintUrl,
    fee: number,
}

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
    cb: (
        proofsToUse: Proof[],
        allOurProofs: Proof[],
    ) => Promise<WithProofReserveCb<T> | null>
): Promise<WalletOperation<T> | null> {
    cashuWallet ??= await wallet.cashuWallet(mint);

    const allProofMints = wallet.state.proofsForMint(mint, false);
    const proofs = cashuWallet.selectProofsToSend(allProofMints, amountWithFees);

    const fetchedAmount = proofs.send.reduce((a, b) => a + b.amount, 0);

    if (fetchedAmount < amountWithFees) return null;

    // reserve the proofs we'll be using
    wallet.state.reserveProofs(proofs.send, amountWithFees);
    let cbResult: WithProofReserveCb<T> | null = null;
    let proofsChange: WalletProofChange | null = null;
    let updateRes: UpdateStateResult | null = null;

    try {
        cbResult = await cb(proofs.send, allProofMints);

        if (!cbResult) return null;

        proofsChange = {
            mint,
            store: cbResult.change,
            destroy: proofs.send,
        }

        /**
         * Update the wallet state in the relays.
         */
        updateRes = await wallet.state.update(proofsChange);
    } finally {
        wallet.state.unreserveProofs(proofs.send, amountWithFees);
    }

    return {
        result: cbResult.result,
        proofsChange,
        stateUpdate: updateRes,
        mint,
        fee: calculateFee(amountWithoutFees, proofs.send, cbResult.change),
    }
}
