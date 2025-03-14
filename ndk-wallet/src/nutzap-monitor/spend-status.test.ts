import { CashuWallet, CheckStateEnum } from "@cashu/cashu-ts";
import NDK, { NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";
import { mockNutzap } from "../tests/index.js";
import { getProofSpendState } from "./spend-status";

// Create NDK with a signer
const ndkSigner = NDKPrivateKeySigner.generate();
const ndk = new NDK({ signer: ndkSigner });

describe("spend-status", () => {
    describe("getProofSpendState", () => {
        const wallet = new CashuWallet({} as any);

        it("should correctly map proofs to their spend states", async () => {
            const nutzaps = [
                await mockNutzap("https://mint1.com", 100, ndk, { senderPk: ndkSigner }),
                await mockNutzap("https://mint2.com", 200, ndk, { senderPk: ndkSigner }),
            ];

            wallet.checkProofsStates = jest.fn().mockResolvedValue([
                { state: CheckStateEnum.UNSPENT, Y: "1", witness: "1" }, // UNSPENT
                { state: CheckStateEnum.SPENT, Y: "1", witness: "1" }, // SPENT
            ]);

            const result = await getProofSpendState(wallet, nutzaps);

            expect(result.unspentProofs).toHaveLength(1);
            expect(result.spentProofs).toHaveLength(1);
            expect(result.nutzapsWithUnspentProofs).toHaveLength(1);
            expect(result.nutzapsWithSpentProofs).toHaveLength(1);
            expect(result.nutzapsWithUnspentProofs[0].id).toBe(nutzaps[0].id);
            expect(result.nutzapsWithSpentProofs[0].id).toBe(nutzaps[1].id);
        });

        it("should deduplicate proofs by C value", async () => {
            const nutzap = await mockNutzap("https://mint1.com", 100, ndk, { senderPk: ndkSigner });
            const duplicateProof = { ...nutzap.proofs[0] };

            nutzap.proofs.push(duplicateProof);

            wallet.checkProofsStates = jest
                .fn()
                .mockResolvedValue([{ state: CheckStateEnum.UNSPENT, Y: "1", witness: "1" }]);

            const result = await getProofSpendState(wallet, [nutzap]);

            expect(wallet.checkProofsStates).toHaveBeenCalledWith([nutzap.proofs[0]]);
            expect(result.unspentProofs).toHaveLength(1);
        });

        it("should handle empty nutzap array", async () => {
            const freshWallet = new CashuWallet({} as any);
            freshWallet.checkProofsStates = jest.fn().mockResolvedValue([]);

            const result = await getProofSpendState(freshWallet, []);

            expect(result.unspentProofs).toHaveLength(0);
            expect(result.spentProofs).toHaveLength(0);
            expect(result.nutzapsWithUnspentProofs).toHaveLength(0);
            expect(result.nutzapsWithSpentProofs).toHaveLength(0);
            expect(freshWallet.checkProofsStates).toHaveBeenCalledWith([]);
        });

        it("should handle nutzaps with empty proofs", async () => {
            const nutzap = await mockNutzap("https://mint1.com", 100, ndk, { senderPk: ndkSigner });
            nutzap.proofs = [];

            wallet.checkProofsStates = jest.fn().mockResolvedValue([]);

            const result = await getProofSpendState(wallet, [nutzap]);

            expect(result.unspentProofs).toHaveLength(0);
            expect(result.spentProofs).toHaveLength(0);
            expect(result.nutzapsWithUnspentProofs).toHaveLength(0);
            expect(result.nutzapsWithSpentProofs).toHaveLength(0);
            expect(wallet.checkProofsStates).toHaveBeenCalledWith([]);
        });

        it("should handle nutzaps with multiple proofs correctly", async () => {
            // Create a nutzap with multiple proofs
            const nutzap = await mockNutzap("https://mint1.com", 100, undefined, {
                senderPk: ndkSigner,
            });

            // Add a second proof
            const secondProof = {
                ...nutzap.proofs[0],
                C: "differentC",
                amount: 50,
            };
            nutzap.proofs.push(secondProof);

            // Mock checkProofsStates to return one spent and one unspent
            wallet.checkProofsStates = jest.fn().mockResolvedValue([
                { state: CheckStateEnum.UNSPENT, Y: "1", witness: "1" },
                { state: CheckStateEnum.SPENT, Y: "1", witness: "1" },
            ]);

            const result = await getProofSpendState(wallet, [nutzap]);

            // Both the spent and unspent arrays should have the same nutzap
            expect(result.unspentProofs).toHaveLength(1);
            expect(result.spentProofs).toHaveLength(1);

            // The nutzap should be in both spent and unspent arrays
            expect(result.nutzapsWithUnspentProofs).toHaveLength(1);
            expect(result.nutzapsWithSpentProofs).toHaveLength(1);
            expect(result.nutzapsWithUnspentProofs[0].id).toBe(nutzap.id);
            expect(result.nutzapsWithSpentProofs[0].id).toBe(nutzap.id);
        });

        it("should handle error responses from checkProofsStates gracefully", async () => {
            const nutzap = await mockNutzap("https://mint1.com", 100, undefined, {
                senderPk: ndkSigner,
            });

            // Mock checkProofsStates to throw an error
            wallet.checkProofsStates = jest.fn().mockRejectedValue(new Error("Mint server error"));

            // The function should gracefully handle errors
            await expect(getProofSpendState(wallet, [nutzap])).rejects.toThrow("Mint server error");
        });

        it("should process mixed nutzaps where some have spent and some have unspent proofs", async () => {
            const nutzaps = [
                await mockNutzap("https://mint1.com", 100, ndk, { senderPk: ndkSigner }),
                await mockNutzap("https://mint1.com", 200, ndk, { senderPk: ndkSigner }),
                await mockNutzap("https://mint1.com", 300, ndk, { senderPk: ndkSigner }),
            ];

            // Make unique 'C' values for each proof
            nutzaps[1].proofs[0].C = "uniqueC1";
            nutzaps[2].proofs[0].C = "uniqueC2";

            wallet.checkProofsStates = jest.fn().mockResolvedValue([
                { state: CheckStateEnum.UNSPENT, Y: "1", witness: "1" }, // UNSPENT
                { state: CheckStateEnum.SPENT, Y: "1", witness: "1" }, // SPENT
                { state: CheckStateEnum.UNSPENT, Y: "1", witness: "1" }, // UNSPENT
            ]);

            const result = await getProofSpendState(wallet, nutzaps);

            expect(result.unspentProofs).toHaveLength(2);
            expect(result.spentProofs).toHaveLength(1);
            expect(result.nutzapsWithUnspentProofs).toHaveLength(2);
            expect(result.nutzapsWithSpentProofs).toHaveLength(1);

            // The first and third nutzaps should be unspent
            expect(result.nutzapsWithUnspentProofs.map((n) => n.id)).toContain(nutzaps[0].id);
            expect(result.nutzapsWithUnspentProofs.map((n) => n.id)).toContain(nutzaps[2].id);

            // The second nutzap should be spent
            expect(result.nutzapsWithSpentProofs.map((n) => n.id)).toContain(nutzaps[1].id);
        });
    });
});
