/**
 * Test that NOTICE messages are properly detected to identify lack of negentropy support
 */

import type { NDKFilter, NDKRelay } from "@nostr-dev-kit/ndk";
import { beforeEach, describe, expect, test } from "vitest";
import { NegentropyStorage } from "../negentropy/storage.js";
import { SyncSession } from "../relay/sync-session.js";

describe("Relay NOTICE detection for negentropy support", () => {
    let mockRelay: NDKRelay;
    let storage: NegentropyStorage;
    let filters: NDKFilter[];
    let noticeHandler: ((noticeText: string) => void) | undefined;

    beforeEach(() => {
        storage = new NegentropyStorage();
        storage.seal();
        filters = [{ kinds: [1], limit: 10 }];

        // Create a mock relay
        mockRelay = {
            url: "wss://test.relay",
            connected: true,
            connectivity: {
                send: async () => {},
            },
            registerProtocolHandler: () => {},
            unregisterProtocolHandler: () => {},
            on: (event: string, handler: any) => {
                if (event === "notice") {
                    noticeHandler = handler;
                }
            },
            once: () => {},
            off: () => {},
        } as unknown as NDKRelay;
    });

    test("should detect negentropy disabled via NOTICE", async () => {
        const session = new SyncSession(mockRelay, filters, storage, {});

        // Start session (will timeout since we're not sending real messages)
        const syncPromise = session.start();

        // Simulate relay sending NOTICE about negentropy being disabled
        await new Promise((resolve) => setTimeout(resolve, 100));

        if (noticeHandler) {
            noticeHandler("ERROR: bad msg: negentropy disabled");
        }

        // Should reject with negentropy error
        await expect(syncPromise).rejects.toThrow(/does not support negentropy/i);
    });

    test("should detect bad message via NOTICE", async () => {
        const session = new SyncSession(mockRelay, filters, storage, {});

        const syncPromise = session.start();

        await new Promise((resolve) => setTimeout(resolve, 100));

        if (noticeHandler) {
            noticeHandler("error: bad message");
        }

        await expect(syncPromise).rejects.toThrow(/does not support negentropy/i);
    });

    test("should ignore unrelated NOTICE messages", async () => {
        const session = new SyncSession(mockRelay, filters, storage, { timeout: 1000 });

        const syncPromise = session.start();

        await new Promise((resolve) => setTimeout(resolve, 100));

        // Send an unrelated NOTICE
        if (noticeHandler) {
            noticeHandler("Some other relay notice");
        }

        // Should timeout instead of erroring immediately
        await expect(syncPromise).rejects.toThrow(/timeout/i);
    });

    test("should detect various negentropy error patterns", async () => {
        const errorPatterns = [
            "ERROR: bad msg: negentropy disabled",
            "error: bad message",
            "unknown msg type",
            "unsupported protocol: NEG-OPEN",
            "negentropy not supported",
        ];

        for (const errorMsg of errorPatterns) {
            const session = new SyncSession(mockRelay, filters, storage, {});
            const syncPromise = session.start();

            await new Promise((resolve) => setTimeout(resolve, 50));

            if (noticeHandler) {
                noticeHandler(errorMsg);
            }

            await expect(syncPromise).rejects.toThrow(/does not support negentropy/i);
        }
    });
});
