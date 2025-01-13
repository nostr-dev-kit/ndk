import { NDKEvent } from ".";
import { NDK } from "../ndk"
import { NDKPrivateKeySigner } from "../signers/private-key";

const ndk = new NDK({
    signer: NDKPrivateKeySigner.generate()
});
let event1: NDKEvent;

describe("repost", () => {
    beforeEach(async () => {
        event1 = new NDKEvent(ndk);
        event1.kind = 1;
        event1.content = 'hi'
    })

    it('includes the JSON-stringified event', async () => {
        await event1.sign();
        const e = await event1.repost(false);
        await e.sign();

        const payload = JSON.parse(e.content);
        expect(payload.id).toEqual(event1.id);
    })

    it('does not include the JSON-stringified event', async() => {
        event1.isProtected = true;
        await event1.sign();
        const e = await event1.repost(false);
        await e.sign();

        expect(e.content).toEqual("");
    })
})