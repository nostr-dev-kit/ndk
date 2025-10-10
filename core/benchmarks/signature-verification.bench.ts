import { bench, describe } from "vitest";
import { NDKEvent } from "../src/events/index.js";
import { verifiedSignatures } from "../src/events/validation.js";
import { NDK } from "../src/ndk/index.js";
import { NDKPrivateKeySigner } from "../src/signers/private-key/index.js";

describe("Signature Verification Performance", () => {
    bench("verify 100 unique signatures", async () => {
        const ndk = new NDK();
        const signer = NDKPrivateKeySigner.generate();

        const events: NDKEvent[] = [];

        // Create 100 unique events
        for (let i = 0; i < 100; i++) {
            const event = new NDKEvent(ndk, {
                kind: 1,
                content: `test ${i}`,
                tags: [],
                created_at: Math.floor(Date.now() / 1000),
            });
            event.pubkey = (await signer.user()).pubkey;
            await event.sign(signer);
            events.push(event);
        }

        // Verify all
        for (const event of events) {
            event.verifySignature(true);
        }
    });

    bench("verify 100 signatures with 50% cache hit rate", async () => {
        const ndk = new NDK();
        const signer = NDKPrivateKeySigner.generate();

        verifiedSignatures.clear();

        const events: NDKEvent[] = [];

        // Create 50 unique events
        for (let i = 0; i < 50; i++) {
            const event = new NDKEvent(ndk, {
                kind: 1,
                content: `test ${i}`,
                tags: [],
                created_at: Math.floor(Date.now() / 1000),
            });
            event.pubkey = (await signer.user()).pubkey;
            await event.sign(signer);
            events.push(event);
        }

        // Verify each twice (second time should hit cache)
        for (let i = 0; i < 2; i++) {
            for (const event of events) {
                event.verifySignature(true);
            }
        }
    });

    bench("signature cache overflow - 2000 signatures", async () => {
        const ndk = new NDK();
        const signer = NDKPrivateKeySigner.generate();

        verifiedSignatures.clear();

        const events: NDKEvent[] = [];

        // Create 2000 events (current cache is only 1000)
        for (let i = 0; i < 2000; i++) {
            const event = new NDKEvent(ndk, {
                kind: 1,
                content: `test ${i}`,
                tags: [],
                created_at: Math.floor(Date.now() / 1000),
            });
            event.pubkey = (await signer.user()).pubkey;
            await event.sign(signer);
            events.push(event);
        }

        // Verify all (cache will overflow)
        for (const event of events) {
            event.verifySignature(true);
        }

        // Verify first 1000 again (some may have been evicted)
        for (let i = 0; i < 1000; i++) {
            events[i].verifySignature(true);
        }
    });
});
