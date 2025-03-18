import { NDKNip07Signer } from "./index";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

describe("NDKNip07Signer", () => {
    beforeEach(() => {
        // Mock window.nostr
        (global as any).window = {
            nostr: {
                getPublicKey: vi.fn(),
            },
        };
    });

    afterEach(() => {
        delete (global as any).window;
    });

    it("throws 'Not ready' when accessing pubkey before initialization", () => {
        const signer = new NDKNip07Signer();
        expect(() => signer.pubkey).toThrow("Not ready");
    });

    it("provides synchronous access to pubkey after initialization", async () => {
        const mockPubkey = "mock-pubkey";
        (window.nostr!.getPublicKey as any).mockResolvedValue(mockPubkey);

        const signer = new NDKNip07Signer();
        await signer.blockUntilReady();

        expect(signer.pubkey).toBe(mockPubkey);
    });
});
