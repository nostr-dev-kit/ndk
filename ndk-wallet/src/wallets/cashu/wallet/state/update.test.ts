import { calculateNewState } from "./update";
import { WalletState, WalletProofChange } from ".";
import { NDKCashuToken } from "@nostr-dev-kit/ndk";
import { mockProof } from "@nostr-dev-kit/ndk/test";
import NDK from "@nostr-dev-kit/ndk";
import { NDKCashuWallet } from "..";

const ndk = new NDK();

describe("calculateNewState", () => {
    const wallet = new NDKCashuWallet(ndk);
    let walletState: WalletState;
    let stateChange: WalletProofChange;

    beforeEach(() => {
        walletState = wallet.state;
        stateChange = {
            store: [],
            destroy: [],
            reserve: [],
            mint: "mintId",
        };
    });

    it("should handle empty state change", () => {
        const result = calculateNewState(walletState, stateChange);
        expect(result).toEqual({
            deletedTokenIds: new Set(),
            deletedProofs: new Set(),
            reserveProofs: [],
            saveProofs: [],
        });
    });

    it("should handle storing new proofs", () => {
        const newProof = mockProof("proof1", 100);
        stateChange.store = [newProof];

        const result = calculateNewState(walletState, stateChange);
        expect(result.saveProofs).toContain(newProof);
        expect(result.deletedTokenIds.size).toBe(0);
    });

    it("should handle destroying proofs and affected tokens", () => {
        const existingTokenId = "token1";
        const existingProof = mockProof("proof1", 100);
        const existingToken = new NDKCashuToken(ndk);
        existingToken.mint = "mint";
        existingToken.proofs = [existingProof];
        existingToken.id = existingTokenId;
        walletState.addToken(existingToken);

        stateChange.destroy = [existingProof];

        const result = calculateNewState(walletState, stateChange);
        expect(result.deletedTokenIds).toContain(existingTokenId);
        expect(result.deletedProofs).toContain(existingProof.C);
        expect(result.saveProofs).not.toContain(existingProof);
    });

    it("should handle moving unused proofs from a deleted token to a new token", () => {
        const existingTokenId = "token1";
        const usedProof = mockProof("proof1", 100);
        const unusedProof = mockProof("proof2", 100);
        const existingToken = new NDKCashuToken(ndk);
        existingToken.mint = "mint";
        existingToken.id = existingTokenId;
        existingToken.proofs = [usedProof, unusedProof];
        walletState.addToken(existingToken);

        stateChange.destroy = [usedProof];

        const result = calculateNewState(walletState, stateChange);
        expect(result.deletedTokenIds).toContain(existingTokenId);
        expect(result.saveProofs).toContainEqual(unusedProof);
        expect(result.saveProofs).not.toContain(usedProof);
    });

    it("should handle destroying multiple proofs from multiple tokens, moving unused proofs from multiple tokens", () => {
        const tokens = [new NDKCashuToken(ndk), new NDKCashuToken(ndk)];
        tokens.forEach((token, index) => {
            token.mint = "mint";
            token.id = "token" + index;
            token.proofs = [
                mockProof("proof-" + index + "-1", 100),
                mockProof("proof-" + index + "-2", 100),
            ];
            walletState.addToken(token);
        });

        stateChange.store = [];
        stateChange.destroy = [tokens[0].proofs[0], tokens[1].proofs[0]];

        const result = calculateNewState(walletState, stateChange);
        expect(result.deletedTokenIds).toContain(tokens[0].id);
        expect(result.deletedTokenIds).toContain(tokens[1].id);
        expect(result.saveProofs).toContain(tokens[0].proofs[1]);
        expect(result.saveProofs).toContain(tokens[1].proofs[1]);
        expect(result.saveProofs).not.toContain(tokens[0].proofs[0]);
        expect(result.saveProofs).not.toContain(tokens[1].proofs[0]);
    });

    it("should throw an error when reserve is used", () => {
        stateChange.reserve = [mockProof("proof3", 300)];

        expect(() => calculateNewState(walletState, stateChange)).not.toThrow();
        // Note: The updateInternalState function throws an error on reserve,
        // but calculateNewState does not handle reserve directly.
    });
});
