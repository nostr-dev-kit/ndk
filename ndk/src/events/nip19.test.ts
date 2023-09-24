import "websocket-polyfill";

import type { NostrEvent } from ".";
import { NDKEvent } from ".";
import { NDK } from "../ndk";
import { NDKRelay } from "../relay";

let ndk: NDK;

beforeAll(() => {
    ndk = new NDK();
});

describe("NDKEvent", () => {
    describe("encode", () => {
        it("encodes NIP-33 events", () => {
            const event = new NDKEvent(ndk, {
                kind: 30000,
                pubkey: "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52",
                tags: [["d", "1234"]],
            } as NostrEvent);

            const a = event.encode();
            expect(a).toBe(
                "naddr1qqzrzv3nxspzp75cf0tahv5z7plpdeaws7ex52nmnwgtwfr2g3m37r844evqrr6jqvzqqqr4xq098d2k"
            );
        });

        it("encodes NIP-33 events with relay when it's known", () => {
            const event = new NDKEvent(ndk, {
                kind: 30000,
                pubkey: "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52",
                tags: [["d", "1234"]],
            } as NostrEvent);
            event.relay = new NDKRelay("wss://relay.f7z.io");

            const a = event.encode();
            expect(a).toBe(
                "naddr1qqzrzv3nxsq3yamnwvaz7tmjv4kxz7fwvcmh5tnfdupzp75cf0tahv5z7plpdeaws7ex52nmnwgtwfr2g3m37r844evqrr6jqvzqqqr4xq45f5n4"
            );
        });

        it("encodes events as notes when the relay is known", () => {
            const event = new NDKEvent(ndk, {
                kind: 1,
                pubkey: "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52",
                tags: [["d", "1234"]],
            } as NostrEvent);
            event.relay = new NDKRelay("wss://relay.f7z.io");

            const a = event.encode();
            expect(a).toBe(
                "nevent1qqqqzynhwden5te0wfjkccte9enrw73wd9hsyg86np9a0kajstc8u9h846rmy6320wdepdeydfz8w8cv7kh9sqv02gyxar4d"
            );
        });
    });
});
