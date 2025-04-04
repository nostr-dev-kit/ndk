import { TestFixture } from "@nostr-dev-kit/ndk-test-utils";
import { NDKRelay } from "../relay";

let fixture: TestFixture;

beforeAll(() => {
    fixture = new TestFixture();
});

describe("NDKEvent", () => {
    describe("encode", () => {
        it("encodes NIP-33 events", async () => {
            const pubkey = "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52";
            const event = await fixture.eventFactory.createSignedTextNote("", pubkey, 30000);
            event.tags.push(["d", "1234"]);

            const a = event.encode();
            expect(a).toBe(
                "naddr1qvzqqqr4xqpzp75cf0tahv5z7plpdeaws7ex52nmnwgtwfr2g3m37r844evqrr6jqqzrzv3nxsl6m2ff"
            );
        });

        it("encodes NIP-33 events with relay when it's known", async () => {
            const pubkey = "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52";
            const event = await fixture.eventFactory.createSignedTextNote("", pubkey, 30000);
            event.tags.push(["d", "1234"]);
            // Cast to any to avoid type issues with NDKRelay
            event.relay = new NDKRelay("wss://relay.f7z.io/", undefined, fixture.ndk) as any;

            const a = event.encode();
            expect(a).toBe(
                "naddr1qvzqqqr4xqpzp75cf0tahv5z7plpdeaws7ex52nmnwgtwfr2g3m37r844evqrr6jqyfhwumn8ghj7un9d3shjtnxxaazu6t09uqqgvfjxv6qrvzzck"
            );
        });

        it("encodes events as notes when the relay is known", async () => {
            const pubkey = "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52";
            const event = await fixture.eventFactory.createSignedTextNote("hello world", pubkey, 1);
            event.tags.push(["e", "1234"]);
            // Cast to any to avoid type issues with NDKRelay
            event.relay = new NDKRelay("wss://relay.f7z.io/", undefined, fixture.ndk) as any;

            const a = event.encode();
            expect(a).toBe(
                "nevent1qgs04xzt6ldm9qhs0ctw0t58kf4z57umjzmjg6jywu0seadwtqqc75spzdmhxue69uhhyetvv9ujue3h0ghxjme0qqqqcmeuul"
            );
        });
    });
});
