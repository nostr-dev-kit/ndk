import { describe, it, expect, beforeAll } from "bun:test";
import { NDK } from "../../../ndk/index.js";
import { NDKPrivateKeySigner } from "../../../signers/private-key/index.js";
import { mockNutzap, mockProof } from "../../../../test/mocks/nutzaps.js";
import { NDKNutzap } from "./index.js";
import { NutzapValidationCode, NutzapValidationSeverity } from "./validation.js";

describe("NIP-61 Nutzap Validation", () => {
    let ndk: NDK;
    let senderSigner: NDKPrivateKeySigner;
    let recipientPubkey: string;
    let senderPubkey: string;

    beforeAll(async () => {
        ndk = new NDK();
        senderSigner = NDKPrivateKeySigner.generate();
        const recipientSigner = NDKPrivateKeySigner.generate();

        senderPubkey = (await senderSigner.user()).pubkey;
        recipientPubkey = (await recipientSigner.user()).pubkey;
    });

    describe("Valid nutzaps", () => {
        it("should validate a nutzap with e and P tags", async () => {
            const eventId = "event123";
            const nutzap = await mockNutzap("https://mint.example.com", 100, ndk, {
                senderPk: senderSigner,
                recipientPubkey,
                eventId,
            });

            const result = nutzap.validateNIP61();

            expect(result.valid).toBe(true);
            expect(result.issues).toHaveLength(0);
        });

        it("should validate a nutzap without e tag (backwards compatibility)", async () => {
            const nutzap = await mockNutzap("https://mint.example.com", 100, ndk, {
                senderPk: senderSigner,
                recipientPubkey,
            });

            const result = nutzap.validateNIP61();

            // Should be valid but have warnings
            expect(result.valid).toBe(true);
            expect(result.issues.length).toBeGreaterThan(0);
            expect(result.issues.every((i) => i.severity === NutzapValidationSeverity.WARNING)).toBe(true);
        });
    });

    describe("Critical errors", () => {
        it("should fail validation with no proofs", () => {
            const nutzap = new NDKNutzap(ndk);
            nutzap.mint = "https://mint.example.com";
            nutzap.recipientPubkey = recipientPubkey;
            nutzap.proofs = [];

            const result = nutzap.validateNIP61();

            expect(result.valid).toBe(false);
            expect(result.issues).toContainEqual(
                expect.objectContaining({
                    code: NutzapValidationCode.NO_PROOFS,
                    severity: NutzapValidationSeverity.ERROR,
                })
            );
        });

        it("should fail validation with no recipient", async () => {
            const nutzap = new NDKNutzap(ndk);
            nutzap.mint = "https://mint.example.com";
            nutzap.proofs = [mockProof("https://mint.example.com", 100)];

            const result = nutzap.validateNIP61();

            expect(result.valid).toBe(false);
            expect(result.issues).toContainEqual(
                expect.objectContaining({
                    code: NutzapValidationCode.NO_RECIPIENT,
                    severity: NutzapValidationSeverity.ERROR,
                })
            );
        });

        it("should fail validation with multiple recipients", async () => {
            const nutzap = new NDKNutzap(ndk);
            nutzap.mint = "https://mint.example.com";
            nutzap.proofs = [mockProof("https://mint.example.com", 100)];
            nutzap.tags = [
                ["p", recipientPubkey],
                ["p", "another_pubkey"],
            ];

            const result = nutzap.validateNIP61();

            expect(result.valid).toBe(false);
            expect(result.issues).toContainEqual(
                expect.objectContaining({
                    code: NutzapValidationCode.MULTIPLE_RECIPIENTS,
                    severity: NutzapValidationSeverity.ERROR,
                })
            );
        });

        it("should fail validation with no mint", async () => {
            const nutzap = new NDKNutzap(ndk);
            nutzap.recipientPubkey = recipientPubkey;
            nutzap.proofs = [mockProof("https://mint.example.com", 100)];

            const result = nutzap.validateNIP61();

            expect(result.valid).toBe(false);
            expect(result.issues).toContainEqual(
                expect.objectContaining({
                    code: NutzapValidationCode.NO_MINT,
                    severity: NutzapValidationSeverity.ERROR,
                })
            );
        });

        it("should fail validation with multiple mints", async () => {
            const nutzap = new NDKNutzap(ndk);
            nutzap.recipientPubkey = recipientPubkey;
            nutzap.proofs = [mockProof("https://mint.example.com", 100)];
            nutzap.tags = [
                ["p", recipientPubkey],
                ["u", "https://mint1.example.com"],
                ["u", "https://mint2.example.com"],
            ];

            const result = nutzap.validateNIP61();

            expect(result.valid).toBe(false);
            expect(result.issues).toContainEqual(
                expect.objectContaining({
                    code: NutzapValidationCode.MULTIPLE_MINTS,
                    severity: NutzapValidationSeverity.ERROR,
                })
            );
        });

        it("should fail validation with multiple event tags", async () => {
            const nutzap = await mockNutzap("https://mint.example.com", 100, ndk, {
                senderPk: senderSigner,
                recipientPubkey,
                eventId: "event1",
            });
            nutzap.tags.push(["e", "event2"]);

            const result = nutzap.validateNIP61();

            expect(result.valid).toBe(false);
            expect(result.issues).toContainEqual(
                expect.objectContaining({
                    code: NutzapValidationCode.MULTIPLE_EVENT_TAGS,
                    severity: NutzapValidationSeverity.ERROR,
                })
            );
        });

        it("should fail validation with malformed proof secret", () => {
            const nutzap = new NDKNutzap(ndk);
            nutzap.mint = "https://mint.example.com";
            nutzap.recipientPubkey = recipientPubkey;
            nutzap.proofs = [
                {
                    id: "test",
                    amount: 100,
                    C: "test",
                    secret: "not valid json",
                },
            ];

            const result = nutzap.validateNIP61();

            expect(result.valid).toBe(false);
            expect(result.issues).toContainEqual(
                expect.objectContaining({
                    code: NutzapValidationCode.MALFORMED_PROOF_SECRET,
                    severity: NutzapValidationSeverity.ERROR,
                    proofIndex: 0,
                })
            );
        });
    });

    describe("Warnings (non-critical)", () => {
        it("should warn when event has e tag but proof is missing e tag", async () => {
            const eventId = "event123";
            const nutzap = new NDKNutzap(ndk);
            nutzap.mint = "https://mint.example.com";
            nutzap.recipientPubkey = recipientPubkey;
            nutzap.tags.push(["e", eventId]);
            // Create proof without e tag
            nutzap.proofs = [mockProof("mint", 100, recipientPubkey, [["P", senderPubkey]])];
            await nutzap.sign(senderSigner);

            const result = nutzap.validateNIP61();

            // Should be valid but have warning
            expect(result.valid).toBe(true);
            expect(result.issues).toContainEqual(
                expect.objectContaining({
                    code: NutzapValidationCode.MISSING_EVENT_TAG_IN_PROOF,
                    severity: NutzapValidationSeverity.WARNING,
                    proofIndex: 0,
                })
            );
        });

        it("should warn when proof e tag doesn't match event e tag", async () => {
            const nutzap = new NDKNutzap(ndk);
            nutzap.mint = "https://mint.example.com";
            nutzap.recipientPubkey = recipientPubkey;
            nutzap.tags.push(["e", "event1"]);
            // Create proof with different e tag
            nutzap.proofs = [mockProof("mint", 100, recipientPubkey, [["e", "event2"], ["P", senderPubkey]])];
            await nutzap.sign(senderSigner);

            const result = nutzap.validateNIP61();

            // Should be valid but have warning
            expect(result.valid).toBe(true);
            expect(result.issues).toContainEqual(
                expect.objectContaining({
                    code: NutzapValidationCode.MISMATCHED_EVENT_TAG_IN_PROOF,
                    severity: NutzapValidationSeverity.WARNING,
                    proofIndex: 0,
                })
            );
        });

        it("should warn when proof is missing P tag", async () => {
            const eventId = "event123";
            const nutzap = new NDKNutzap(ndk);
            nutzap.mint = "https://mint.example.com";
            nutzap.recipientPubkey = recipientPubkey;
            nutzap.tags.push(["e", eventId]);
            // Create proof without P tag
            nutzap.proofs = [mockProof("mint", 100, recipientPubkey, [["e", eventId]])];
            await nutzap.sign(senderSigner);

            const result = nutzap.validateNIP61();

            // Should be valid but have warning
            expect(result.valid).toBe(true);
            expect(result.issues).toContainEqual(
                expect.objectContaining({
                    code: NutzapValidationCode.MISSING_SENDER_TAG_IN_PROOF,
                    severity: NutzapValidationSeverity.WARNING,
                    proofIndex: 0,
                })
            );
        });

        it("should warn when proof P tag doesn't match sender pubkey", async () => {
            const eventId = "event123";
            const nutzap = new NDKNutzap(ndk);
            nutzap.mint = "https://mint.example.com";
            nutzap.recipientPubkey = recipientPubkey;
            nutzap.tags.push(["e", eventId]);
            // Create proof with wrong P tag
            nutzap.proofs = [mockProof("mint", 100, recipientPubkey, [["e", eventId], ["P", "wrong_pubkey"]])];
            await nutzap.sign(senderSigner);

            const result = nutzap.validateNIP61();

            // Should be valid but have warning
            expect(result.valid).toBe(true);
            expect(result.issues).toContainEqual(
                expect.objectContaining({
                    code: NutzapValidationCode.MISMATCHED_SENDER_TAG_IN_PROOF,
                    severity: NutzapValidationSeverity.WARNING,
                    proofIndex: 0,
                })
            );
        });

        it("should warn when event is missing e tag", async () => {
            const nutzap = await mockNutzap("https://mint.example.com", 100, ndk, {
                senderPk: senderSigner,
                recipientPubkey,
                // No eventId
            });

            const result = nutzap.validateNIP61();

            // Should be valid but have warning
            expect(result.valid).toBe(true);
            expect(result.issues).toContainEqual(
                expect.objectContaining({
                    code: NutzapValidationCode.NO_EVENT_TAG_IN_EVENT,
                    severity: NutzapValidationSeverity.WARNING,
                })
            );
        });
    });

    describe("isValid getter", () => {
        it("should return true for valid nutzaps", async () => {
            const eventId = "event123";
            const nutzap = await mockNutzap("https://mint.example.com", 100, ndk, {
                senderPk: senderSigner,
                recipientPubkey,
                eventId,
            });

            expect(nutzap.isValid).toBe(true);
        });

        it("should return false for invalid nutzaps", () => {
            const nutzap = new NDKNutzap(ndk);
            nutzap.proofs = [];

            expect(nutzap.isValid).toBe(false);
        });

        it("should return true even with warnings", async () => {
            const nutzap = await mockNutzap("https://mint.example.com", 100, ndk, {
                senderPk: senderSigner,
                recipientPubkey,
                // No eventId - will generate warnings
            });

            expect(nutzap.isValid).toBe(true);
        });
    });
});
