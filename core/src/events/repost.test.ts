import { EventGenerator } from "../../test";
import { NDK } from "../ndk";
import { NDKPrivateKeySigner } from "../signers/private-key";
import { NDKEvent } from ".";

const ndk = new NDK({
    signer: NDKPrivateKeySigner.generate(),
});
let event1: NDKEvent;

describe("repost", () => {
    beforeEach(async () => {
        // Set up the EventGenerator with our NDK instance
        EventGenerator.setNDK(ndk);

        // Create a text note event using EventGenerator
        event1 = new NDKEvent(ndk);
        event1.kind = 1;
        event1.content = "This is a test event";
        await event1.sign();
    });

    it("includes the JSON-stringified event", async () => {
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
