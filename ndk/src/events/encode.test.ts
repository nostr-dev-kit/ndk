import { decode } from "nostr-tools/nip19";
import { NDKEvent } from "./index.js";
import { NDKRelay } from "../relay/index.js";
import type { EventPointer } from "../user/index.js";
import { NDKPrivateKeySigner } from "../signers/private-key/index.js";

describe("event.encode", () => {
    it("encodes all relays the event is known to be on", async () => {
        const event = new NDKEvent(undefined);
        event.kind = 1;
        event.onRelays = [new NDKRelay("wss://relay1"), new NDKRelay("wss://relay2")];
        await event.sign(NDKPrivateKeySigner.generate());

        const encoded = event.encode();
        const { relays } = decode(encoded).data as EventPointer;
        expect(relays).toEqual(["wss://relay1", "wss://relay2"]);
    });
});
