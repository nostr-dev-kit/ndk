import type NDK from "@nostr-dev-kit/ndk";
import { NDKCashuMintList, NDKEvent, NDKKind, NDKSubscriptionCacheUsage } from "@nostr-dev-kit/ndk";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NDKCashuWallet } from "../index";

// Mock NDK modules
vi.mock("@nostr-dev-kit/ndk", async () => {
    const actual = await vi.importActual("@nostr-dev-kit/ndk");
    return {
        ...actual,
        NDKCashuMintList: {
            from: vi.fn(),
        },
        NDKSubscriptionCacheUsage: {
            PARALLEL: "parallel",
        },
    };
});

describe("NDKCashuWallet mintList", () => {
    let ndk: NDK;
    let wallet: NDKCashuWallet;

    beforeEach(() => {
        ndk = {
            fetchEvent: vi.fn(),
            activeUser: { pubkey: "user123" },
            signer: {
                user: vi.fn().mockResolvedValue({ pubkey: "user123" }),
            },
        } as any;

        wallet = new NDKCashuWallet(ndk);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe("mintList getter", () => {
        it("should return undefined when no mint list is set", () => {
            expect(wallet.mintList).toBeUndefined();
        });

        it("should return the mint list when set", async () => {
            const mockMintList = {
                mints: ["https://mint1.example.com", "https://mint2.example.com"],
                relays: ["wss://relay1.example.com", "wss://relay2.example.com"],
                p2pk: "pubkey123",
            };

            // Set the mint list directly (simulating it was fetched)
            (wallet as any)._mintList = mockMintList;

            expect(wallet.mintList).toBe(mockMintList);
        });
    });

    describe("fetchMintList", () => {
        it("should fetch mint list from user's kind:10019 event", async () => {
            const mockEvent = {
                kind: NDKKind.CashuMintList,
                content: "{}",
                pubkey: "user123",
            };

            const mockMintList = {
                mints: ["https://mint.example.com"],
                relays: ["wss://relay.example.com"],
                p2pk: "p2pk123",
            };

            ndk.fetchEvent = vi.fn().mockResolvedValue(mockEvent);
            NDKCashuMintList.from = vi.fn().mockReturnValue(mockMintList);

            const result = await wallet.fetchMintList();

            expect(ndk.fetchEvent).toHaveBeenCalledWith(
                {
                    kinds: [NDKKind.CashuMintList],
                    authors: ["user123"],
                },
                {
                    cacheUsage: NDKSubscriptionCacheUsage.PARALLEL,
                },
            );

            expect(NDKCashuMintList.from).toHaveBeenCalledWith(mockEvent);
            expect(result).toBe(mockMintList);
            expect(wallet.mintList).toBe(mockMintList);
        });

        it("should return undefined when no mint list event is found", async () => {
            ndk.fetchEvent = vi.fn().mockResolvedValue(null);

            const result = await wallet.fetchMintList();

            expect(result).toBeUndefined();
            expect(wallet.mintList).toBeUndefined();
        });

        it("should return undefined when no NDK is set", async () => {
            const walletWithoutNDK = new NDKCashuWallet(null as any);

            const result = await walletWithoutNDK.fetchMintList();

            expect(result).toBeUndefined();
        });

        it("should use activeUser when available", async () => {
            const mockEvent = {
                kind: NDKKind.CashuMintList,
                content: "{}",
                pubkey: "activeuser123",
            };

            const mockMintList = {
                mints: ["https://mint.example.com"],
                relays: ["wss://relay.example.com"],
                p2pk: "p2pk123",
            };

            ndk.activeUser = { pubkey: "activeuser123" };
            ndk.fetchEvent = vi.fn().mockResolvedValue(mockEvent);
            NDKCashuMintList.from = vi.fn().mockReturnValue(mockMintList);

            await wallet.fetchMintList();

            expect(ndk.fetchEvent).toHaveBeenCalledWith(
                {
                    kinds: [NDKKind.CashuMintList],
                    authors: ["activeuser123"],
                },
                {
                    cacheUsage: NDKSubscriptionCacheUsage.PARALLEL,
                },
            );
        });

        it("should fallback to signer user when activeUser is not available", async () => {
            const mockEvent = {
                kind: NDKKind.CashuMintList,
                content: "{}",
                pubkey: "signeruser123",
            };

            const mockMintList = {
                mints: ["https://mint.example.com"],
                relays: ["wss://relay.example.com"],
                p2pk: "p2pk123",
            };

            ndk.activeUser = undefined;
            ndk.signer = {
                user: vi.fn().mockResolvedValue({ pubkey: "signeruser123" }),
            };
            ndk.fetchEvent = vi.fn().mockResolvedValue(mockEvent);
            NDKCashuMintList.from = vi.fn().mockReturnValue(mockMintList);

            await wallet.fetchMintList();

            expect(ndk.signer.user).toHaveBeenCalled();
            expect(ndk.fetchEvent).toHaveBeenCalledWith(
                {
                    kinds: [NDKKind.CashuMintList],
                    authors: ["signeruser123"],
                },
                {
                    cacheUsage: NDKSubscriptionCacheUsage.PARALLEL,
                },
            );
        });

        it("should return undefined when no user is available", async () => {
            ndk.activeUser = undefined;
            ndk.signer = undefined;

            const result = await wallet.fetchMintList();

            expect(result).toBeUndefined();
            expect(ndk.fetchEvent).not.toHaveBeenCalled();
        });
    });

    describe("start() integration with fetchMintList", () => {
        it("should fetch mint list when wallet becomes ready", async () => {
            const mockFetchMintList = vi.spyOn(wallet, "fetchMintList").mockResolvedValue(undefined);

            // Mock the subscription and event handling
            const mockSub = {
                on: vi.fn(),
                start: vi.fn(),
            };

            ndk.subscribe = vi.fn().mockReturnValue(mockSub);

            const startPromise = wallet.start({ pubkey: "user123" });

            // Simulate EOSE (end of stored events) which triggers fetchMintList
            const eoseHandler = mockSub.on.mock.calls.find((call) => call[0] === "eose")?.[1];
            if (eoseHandler) {
                await eoseHandler();
            }

            await startPromise;

            expect(mockFetchMintList).toHaveBeenCalled();
        });
    });
});
