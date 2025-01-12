import type { MeltQuoteResponse, Proof } from "@cashu/cashu-ts";
import type { NDKCashuWallet } from "./wallet";
import { NDKCashuToken } from "./token";
import createDebug from "debug";
import { NDKEvent, NDKKind, NDKPublishError } from "@nostr-dev-kit/ndk";

const d = createDebug("ndk-wallet:cashu:proofs");

export type TokenSelection = {
    usedProofs: Proof[];
    movedProofs: Proof[];
    usedTokens: NDKCashuToken[];
    quote?: MeltQuoteResponse;
    mint: string;
};

export interface RollOverResult {
    destroyedTokens: NDKCashuToken[],
    createdToken: NDKCashuToken | undefined
};

/**
 * Deletes and creates new events to reflect the new state of the proofs
 */
export async function rollOverProofs(
    proofs: TokenSelection,
    changes: Proof[],
    mint: string,
    wallet: NDKCashuWallet,
): Promise<RollOverResult> {
    const relaySet = wallet.relaySet;

    const proofsToSave = proofs.movedProofs;
    for (const change of changes) {
        proofsToSave.push(change);
    }

    let createdToken: NDKCashuToken | undefined;

    if (proofsToSave.length > 0) {
        createdToken = new NDKCashuToken(wallet.ndk);
        createdToken.proofs = proofsToSave;
        createdToken.mint = mint;
        createdToken.wallet = wallet;
        await createdToken.sign();
        d("saving %d new proofs (amounts: %o)", proofsToSave.length, proofsToSave.map((p) => p.amount));

        wallet.addToken(createdToken);

        try {
            await createdToken.publish(wallet.relaySet);
            d("created new token event", createdToken.rawEvent());
        } catch (e) {
            d("failed to publish new token event", (e as NDKPublishError).relayErrors);
        }
    }

    if (proofs.usedTokens.length > 0) {
        // console.trace("rolling over proofs for mint %s %d tokens", mint, proofs.usedTokens.length);

        const deleteEvent = new NDKEvent(wallet.ndk);
        deleteEvent.kind = NDKKind.EventDeletion;
        deleteEvent.tags = [["k", NDKKind.CashuToken.toString()]];

        proofs.usedTokens.forEach((token) => {
            d(
                "adding to delete a token that was seen on relay %s %o",
                token.relay?.url,
                token.onRelays.map((r) => r.url)
            );
            deleteEvent.tag(["e", token.id]);
            if (token.relay) relaySet?.addRelay(token.relay);
        });

        await deleteEvent.sign();
        d("delete event %o sending to %s", deleteEvent.rawEvent(), relaySet?.relayUrls);
        deleteEvent.publish(relaySet);

        // Remove deleted tokens from the wallet
        proofs.usedTokens.forEach((token) => {
            const hasToken = wallet.tokens.find((t) => t.id === token.id);
            if (hasToken) {
                console.log("[ROLL OVER] removing token", token.id);
                wallet.tokens = wallet.tokens.filter((t) => t.id !== token.id);
            } else {
                console.log("[ROLL OVER] token not found", token.id);
            }
        });
    }
    wallet.addUsedTokens(proofs.usedTokens);

    return {
        destroyedTokens: proofs.usedTokens,
        createdToken,
    }
}
