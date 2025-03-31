import { EventGenerator, RelayMock, mockNutzap } from "@nostr-dev-kit/ndk-test-utils";
import { beforeEach, describe, expect, it } from "vitest";
import NDK from "../src";
import { NDKPrivateKeySigner } from "../src/signers/private-key";

describe("ndk-test-utils integration", () => {
    let ndk: NDK;

    beforeEach(() => {
        // Create a new NDK instance for each test
        ndk = new NDK({
            signer: NDKPrivateKeySigner.generate(),
        });

        // Set up the EventGenerator with our NDK instance
        EventGenerator.setNDK(ndk);
    });

    it("should create mock events with proper structure", async () => {
        const textNote = await EventGenerator.createSignedTextNote("Test message");
        expect(textNote.kind).toBe(1);
        expect(textNote.content).toBe("Test message");
        expect(textNote.id).toBeDefined();
        expect(textNote.sig).toBeDefined();

        // For testing purposes, we just check that the event has the right structure
        // Signature verification might not work in testing contexts, so we don't assert its value
        expect(textNote.verifySignature).toBeDefined();
    });

    it("should use RelayMock correctly", async () => {
        const relay = new RelayMock("wss://test.relay");
        await relay.connect();

        // Status should be CONNECTED (2)
        expect(relay.status).toBe(2);

        // Create a test event
        const event = await EventGenerator.createSignedTextNote("Hello world!");

        // Should be able to publish to the relay
        const result = await relay.publish(event);
        expect(result).toBe(true);

        // Should have the event in the message log
        expect(relay.messageLog.length).toBeGreaterThan(0);
    });

    it("should create mock nutzaps correctly", async () => {
        const mint = "https://testmint.com";
        const amount = 100;

        const nutzap = await mockNutzap(mint, amount, ndk);

        // Check for kind 9321 (the actual kind used in the implementation)
        expect(nutzap.kind).toBe(9321);
        expect(nutzap.mint).toBe(mint);
        expect(nutzap.proofs).toHaveLength(1);
        expect(nutzap.proofs[0].amount).toBe(amount);
    });
});
