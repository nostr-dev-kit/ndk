import { nip19 } from "nostr-tools";
import { NDKEvent } from ".";
import { NDKRelay } from "../relay";
import type { EventPointer } from "../user";
import { NDKPrivateKeySigner } from "../signers/private-key";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NDK } from "../ndk";
import { EventGenerator } from "@nostr-dev-kit/ndk-test-utils";

describe("event.encode", () => {
    let mockNdk: NDK;

    beforeEach(() => {
        // Create a mock NDK instance
        mockNdk = new NDK();
        EventGenerator.setNDK(mockNdk);
    });

    it("encodes all relays the event is known to be on", async () => {
        // Use EventGenerator to create a kind 1 text note
        const event = EventGenerator.createEvent(1);
        await event.sign(NDKPrivateKeySigner.generate());

        // Mock the onRelays getter to return our test relays
        const testRelays = [
            new NDKRelay("wss://relay1/", undefined, mockNdk),
            new NDKRelay("wss://relay2/", undefined, mockNdk),
        ];

        vi.spyOn(event, "onRelays", "get").mockReturnValue(testRelays);

        const encoded = event.encode();
        const { relays } = nip19.decode(encoded).data as EventPointer;
        expect(relays).toEqual(["wss://relay1/", "wss://relay2/"]);
    });
});
