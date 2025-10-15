import { bytesToHex, hexToBytes } from "@noble/hashes/utils";
import { describe, expect, it } from "vitest";
import { decrypt, encrypt } from "./index.js";

describe("NIP-49 - ncryptsec", () => {
    const password = "test-password-123";
    const privateKeyHex = "14c226dbdd865d5e1645e72c7470fd0a17feb42cc87b750bab6538171b3a3f8a";
    const privateKeyBytes = hexToBytes(privateKeyHex);

    describe("encrypt and decrypt", () => {
        it("should encrypt and decrypt a private key successfully", () => {
            const encrypted = encrypt(privateKeyBytes, password);

            // Check that it's a valid ncryptsec string
            expect(encrypted).toMatch(/^ncryptsec1[a-z0-9]+$/);

            // Decrypt and verify we get the same private key back
            const decrypted = decrypt(encrypted, password);
            expect(bytesToHex(decrypted)).toBe(privateKeyHex);
        });

        it("should fail to decrypt with wrong password", () => {
            const encrypted = encrypt(privateKeyBytes, password);

            expect(() => {
                decrypt(encrypted, "wrong-password");
            }).toThrow();
        });

        it("should support different log_n values", () => {
            // Test with log_n = 16 (default, fast)
            const encrypted16 = encrypt(privateKeyBytes, password, 16);
            const decrypted16 = decrypt(encrypted16, password);
            expect(bytesToHex(decrypted16)).toBe(privateKeyHex);

            // Test with log_n = 18 (more secure)
            const encrypted18 = encrypt(privateKeyBytes, password, 18);
            const decrypted18 = decrypt(encrypted18, password);
            expect(bytesToHex(decrypted18)).toBe(privateKeyHex);
        });

        it("should support different key security byte values", () => {
            // Test with ksb = 0x00 (key has no privilege)
            const encrypted00 = encrypt(privateKeyBytes, password, 16, 0x00);
            const decrypted00 = decrypt(encrypted00, password);
            expect(bytesToHex(decrypted00)).toBe(privateKeyHex);

            // Test with ksb = 0x01 (key has privilege)
            const encrypted01 = encrypt(privateKeyBytes, password, 16, 0x01);
            const decrypted01 = decrypt(encrypted01, password);
            expect(bytesToHex(decrypted01)).toBe(privateKeyHex);

            // Test with ksb = 0x02 (default, unknown privilege)
            const encrypted02 = encrypt(privateKeyBytes, password, 16, 0x02);
            const decrypted02 = decrypt(encrypted02, password);
            expect(bytesToHex(decrypted02)).toBe(privateKeyHex);
        });

        it("should handle empty password", () => {
            const emptyPassword = "";
            const encrypted = encrypt(privateKeyBytes, emptyPassword);
            const decrypted = decrypt(encrypted, emptyPassword);
            expect(bytesToHex(decrypted)).toBe(privateKeyHex);
        });

        it("should handle unicode passwords correctly", () => {
            const unicodePassword = "ÅΩṩ🔑";
            const encrypted = encrypt(privateKeyBytes, unicodePassword);
            const decrypted = decrypt(encrypted, unicodePassword);
            expect(bytesToHex(decrypted)).toBe(privateKeyHex);
        });

        it("should produce different ciphertexts for same input (due to random salt/nonce)", () => {
            const encrypted1 = encrypt(privateKeyBytes, password);
            const encrypted2 = encrypt(privateKeyBytes, password);

            // Should be different due to random salt and nonce
            expect(encrypted1).not.toBe(encrypted2);

            // But both should decrypt to the same private key
            expect(bytesToHex(decrypt(encrypted1, password))).toBe(privateKeyHex);
            expect(bytesToHex(decrypt(encrypted2, password))).toBe(privateKeyHex);
        });
    });

    describe("error handling", () => {
        it("should throw error for invalid ncryptsec format", () => {
            expect(() => {
                decrypt("invalid-ncryptsec", password);
            }).toThrow();
        });

        it("should throw error for wrong prefix", () => {
            // Use nsec (wrong prefix) instead of ncryptsec
            expect(() => {
                decrypt("nsec1vl029mgpspedva04g90vltkh6fvh240zqtv9k0t9af8935ke9laqsnlfe5", password);
            }).toThrow(/prefix/);
        });
    });
});
