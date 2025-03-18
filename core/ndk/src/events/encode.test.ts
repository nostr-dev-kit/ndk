import { nip19 } from "nostr-tools";
import { NDKEvent } from ".";
import { NDKRelay } from "../relay";
import type { EventPointer } from "../user";
import { NDKPrivateKeySigner } from "../signers/private-key";
import { describe, it, expect, vi } from "vitest";
import { NDK } from "../ndk";

describe("event.encode", () => {
    it("encodes all relays the event is known to be on", async () => {
        const event = new NDKEvent(undefined);
        event.kind = 1;
        await event.sign(NDKPrivateKeySigner.generate());

        // Create a mock NDK instance
        const mockNdk = new NDK();

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
