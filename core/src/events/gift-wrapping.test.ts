import { beforeEach, describe, expect, it } from "vitest";
import { NDK } from "../ndk/index.js";
import { NDKPrivateKeySigner } from "../signers/private-key/index.js";
import type { NDKCacheAdapter, NDKEventId } from "../cache/index.js";
import { NDKEvent } from "./index.js";
import { NDKKind } from "./kinds/index.js";
import { giftWrap, giftUnwrap } from "./gift-wrapping.js";

// Mock cache adapter to track cache operations
class MockCacheAdapter implements Partial<NDKCacheAdapter> {
    public locking = false;
    private cache = new Map<NDKEventId, NDKEvent>();
    public getDecryptedEventCalls: string[] = [];
    public addDecryptedEventCalls: Array<{ wrapperId: string; rumorId: string }> = [];

    async getDecryptedEvent(wrapperId: NDKEventId): Promise<NDKEvent | null> {
        this.getDecryptedEventCalls.push(wrapperId);
        return this.cache.get(wrapperId) ?? null;
    }

    async addDecryptedEvent(wrapperId: NDKEventId, decryptedEvent: NDKEvent): Promise<void> {
        this.addDecryptedEventCalls.push({ wrapperId, rumorId: decryptedEvent.id });
        this.cache.set(wrapperId, decryptedEvent);
    }

    reset() {
        this.getDecryptedEventCalls = [];
        this.addDecryptedEventCalls = [];
    }

    clearCache() {
        this.cache.clear();
        this.getDecryptedEventCalls = [];
        this.addDecryptedEventCalls = [];
    }
}

describe("NIP-17 Gift Wrapping Cache", () => {
    let ndk: NDK;
    let aliceSigner: NDKPrivateKeySigner;
    let bobSigner: NDKPrivateKeySigner;
    let mockCache: MockCacheAdapter;

    beforeEach(async () => {
        mockCache = new MockCacheAdapter();
        ndk = new NDK({ cacheAdapter: mockCache as any });

        aliceSigner = NDKPrivateKeySigner.generate();
        bobSigner = NDKPrivateKeySigner.generate();
    });

    it("should cache decrypted gift-wrapped events using wrapper ID as key", async () => {
        const bob = await bobSigner.user();

        // Alice creates a rumor
        const rumor = new NDKEvent(ndk);
        rumor.kind = NDKKind.PrivateDirectMessage;
        rumor.content = "Secret message";
        rumor.created_at = Math.floor(Date.now() / 1000);
        rumor.tags = [["p", bob.pubkey]];
        rumor.pubkey = (await aliceSigner.user()).pubkey;

        // Alice gift-wraps the rumor for Bob
        const wrapped = await giftWrap(rumor, bob, aliceSigner);
        wrapped.ndk = ndk;

        // First unwrap - should decrypt and cache
        mockCache.clearCache();
        const unwrapped1 = await giftUnwrap(wrapped, undefined, bobSigner);

        expect(unwrapped1.content).toBe("Secret message");
        expect(mockCache.getDecryptedEventCalls).toHaveLength(1);
        expect(mockCache.getDecryptedEventCalls[0]).toBe(wrapped.id);
        expect(mockCache.addDecryptedEventCalls).toHaveLength(1);
        expect(mockCache.addDecryptedEventCalls[0].wrapperId).toBe(wrapped.id);
        expect(mockCache.addDecryptedEventCalls[0].rumorId).toBe(unwrapped1.id);

        // Second unwrap - should hit cache, no decryption
        mockCache.reset();
        const unwrapped2 = await giftUnwrap(wrapped, undefined, bobSigner);

        expect(unwrapped2.content).toBe("Secret message");
        expect(unwrapped2.id).toBe(unwrapped1.id);
        expect(mockCache.getDecryptedEventCalls).toHaveLength(1);
        expect(mockCache.getDecryptedEventCalls[0]).toBe(wrapped.id);
        expect(mockCache.addDecryptedEventCalls).toHaveLength(0); // No cache write on hit

        // Third unwrap - should still hit cache
        mockCache.reset();
        const unwrapped3 = await giftUnwrap(wrapped, undefined, bobSigner);

        expect(unwrapped3.content).toBe("Secret message");
        expect(unwrapped3.id).toBe(unwrapped1.id);
        expect(mockCache.getDecryptedEventCalls).toHaveLength(1);
        expect(mockCache.addDecryptedEventCalls).toHaveLength(0);
    });

    it("should use wrapper ID not rumor ID for cache key", async () => {
        const bob = await bobSigner.user();

        const rumor = new NDKEvent(ndk);
        rumor.kind = NDKKind.PrivateDirectMessage;
        rumor.content = "Test message";
        rumor.created_at = Math.floor(Date.now() / 1000);
        rumor.tags = [["p", bob.pubkey]];
        rumor.pubkey = (await aliceSigner.user()).pubkey;

        const wrapped = await giftWrap(rumor, bob, aliceSigner);
        wrapped.ndk = ndk;

        const unwrapped = await giftUnwrap(wrapped, undefined, bobSigner);

        // Verify that the cache key is the wrapper ID, not the rumor ID
        expect(mockCache.addDecryptedEventCalls).toHaveLength(1);
        expect(mockCache.addDecryptedEventCalls[0].wrapperId).toBe(wrapped.id);
        expect(mockCache.addDecryptedEventCalls[0].rumorId).toBe(unwrapped.id);
        expect(mockCache.addDecryptedEventCalls[0].wrapperId).not.toBe(mockCache.addDecryptedEventCalls[0].rumorId);
    });

    it("should work without cache adapter", async () => {
        // Create NDK without cache adapter
        const ndkNoCache = new NDK({});
        const bob = await bobSigner.user();

        const rumor = new NDKEvent(ndkNoCache);
        rumor.kind = NDKKind.PrivateDirectMessage;
        rumor.content = "Message without cache";
        rumor.created_at = Math.floor(Date.now() / 1000);
        rumor.tags = [["p", bob.pubkey]];
        rumor.pubkey = (await aliceSigner.user()).pubkey;

        const wrapped = await giftWrap(rumor, bob, aliceSigner);
        wrapped.ndk = ndkNoCache;

        // Should not throw, just skip caching
        const unwrapped = await giftUnwrap(wrapped, undefined, bobSigner);
        expect(unwrapped.content).toBe("Message without cache");
    });
});
