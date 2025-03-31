import { EventGenerator } from "@nostr-dev-kit/ndk-test-utils";
import type { NDKEvent } from ".";
import { NDK } from "../ndk";
import { NDKPrivateKeySigner } from "../signers/private-key";

const ndk = new NDK({
    signer: NDKPrivateKeySigner.generate(),
});
let event1: NDKEvent;

describe("repost", () => {
    beforeEach(async () => {
        // Set up the EventGenerator with our NDK instance
        EventGenerator.setNDK(ndk);

        // Create a text note event using EventGenerator
        event1 = EventGenerator.createEvent(1, "hi");
    });

    it("includes the JSON-stringified event", async () => {
        await event1.sign();
        const e = await event1.repost(false);
        await e.sign();

        const payload = JSON.parse(e.content);
        expect(payload.id).toEqual(event1.id);
    });

    it("does not include the JSON-stringified event", async () => {
        event1.isProtected = true;
        await event1.sign();
        const e = await event1.repost(false);
        await e.sign();

        expect(e.content).toEqual("");
    });
});
