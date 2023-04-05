import NDK from "../index";
import NDKEvent from "./index";

describe("NDKEvent", () => {
    let ndk: NDK;
    let event: NDKEvent;

    beforeEach(() => {
        ndk = new NDK();
        event = new NDKEvent(ndk);
    });

    describe("toNostrEvent", () => {
        it("returns a NostrEvent object", async () => {
            const nostrEvent = await event.toNostrEvent();
            expect(nostrEvent).toHaveProperty("created_at");
            expect(nostrEvent).toHaveProperty("content");
            expect(nostrEvent).toHaveProperty("tags");
            expect(nostrEvent).toHaveProperty("kind");
            expect(nostrEvent).toHaveProperty("pubkey");
            expect(nostrEvent).toHaveProperty("id");
        });
    });

    describe("tagReference", () => {
        it("returns the correct tag for referencing the event", () => {
            const event1 = new NDKEvent(ndk, {
                created_at: Date.now()/1000,
                content: "",
                kind: 30000,
                pubkey: "pubkey",
                tags: [["d", "d-code"]],
            });

            const event2 = new NDKEvent(ndk, {
                created_at: Date.now()/1000,
                content: "",
                tags: [],
                kind: 1,
                pubkey: "pubkey",
                id: "eventid",
            });

            expect(event1.tagReference()).toEqual(["d", "30000:pubkey:d-code"]);
            expect(event2.tagReference()).toEqual(["e", "eventid"]);
        });
    });
});
