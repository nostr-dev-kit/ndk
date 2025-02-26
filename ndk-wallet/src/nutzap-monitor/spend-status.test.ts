import { describe, it, expect, vi, beforeEach } from "vitest";
import { CashuWallet, CheckStateEnum } from "@cashu/cashu-ts";
import NDK, { NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";
import { mockNutzap } from "@nostr-dev-kit/ndk-test";
import { getProofSpendState } from "./spend-status";

const ndk = new NDK();
const ndkSigner = NDKPrivateKeySigner.generate();

describe("spend-status", () => {
    describe("getProofSpendState", () => {
        const wallet = new CashuWallet({} as any);
        
        it("should correctly map proofs to their spend states", async () => {
            const nutzaps = [
                await mockNutzap('https://mint1.com', 100, ndk, { senderPk: ndkSigner }),
                await mockNutzap('https://mint2.com', 200, ndk, { senderPk: ndkSigner }),
            ];

            vi.spyOn(wallet, 'checkProofsStates').mockResolvedValue([
                { state: CheckStateEnum.UNSPENT, Y: '1', witness: '1' }, // UNSPENT
                { state: CheckStateEnum.SPENT, Y: '1', witness: '1' }, // SPENT
            ]);

            const result = await getProofSpendState(wallet, nutzaps);
            
            expect(result).toHaveLength(2);
            expect(result.unspentProofs).toHaveLength(1);
            expect(result.spentProofs).toHaveLength(1);
            expect(result.nutzapsWithUnspentProofs).toHaveLength(1);
            expect(result.nutzapsWithSpentProofs).toHaveLength(1);
            expect(result.unspentProofs[0].id).toBe(nutzaps[0].id);
            expect(result.spentProofs[0].id).toBe(nutzaps[1].id);
        });

        it("should deduplicate proofs by C value", async () => {
            const nutzap = await mockNutzap('https://mint1.com', 100, undefined, { senderPk: ndkSigner });
            const duplicateProof = { ...nutzap.proofs[0] };
            
            nutzap.proofs.push(duplicateProof);

            vi.spyOn(wallet, 'checkProofsStates').mockResolvedValue([
                { state: CheckStateEnum.UNSPENT, Y: '1', witness: '1' },
            ]);

            const result = await getProofSpendState(wallet, [nutzap]);
            
            expect(wallet.checkProofsStates).toHaveBeenCalledWith([nutzap.proofs[0]]);
            expect(result).toHaveLength(1);
        });
    });
}); 