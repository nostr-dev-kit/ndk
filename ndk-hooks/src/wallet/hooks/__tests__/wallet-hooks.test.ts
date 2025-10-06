import { NDKKind } from "@nostr-dev-kit/ndk";
import { NDKCashuWallet } from "@nostr-dev-kit/wallet";
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useNDKWallet } from "../index";

// Mock NDK modules
vi.mock("@nostr-dev-kit/ndk", () => ({
    NDKKind: {
        CashuWallet: 37375,
        CashuMintList: 10019,
    },
}));

vi.mock("@nostr-dev-kit/wallet", () => ({
    NDKCashuWallet: vi.fn().mockImplementation(() => ({
        start: vi.fn().mockResolvedValue(undefined),
        on: vi.fn(),
        off: vi.fn(),
        balance: { amount: 100 },
        mints: ["https://mint.example.com"],
        mintList: undefined,
        fetchMintList: vi.fn(),
    })),
}));

// Mock hooks
const mockNDK = {
    fetchEvent: vi.fn(),
    wallet: undefined,
    activeUser: { pubkey: "user123" },
    signer: {
        user: vi.fn().mockResolvedValue({ pubkey: "user123" }),
    },
};

const mockCurrentUser = {
    pubkey: "user123",
};

vi.mock("../../../ndk/hooks", () => ({
    useNDK: () => ({ ndk: mockNDK }),
    useNDKCurrentUser: () => mockCurrentUser,
}));

// TODO: These tests need to be refactored to avoid vi.mock issues with React
describe.skip("useNDKWallet", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("should initialize with null wallet and loading state", () => {
        const { result } = renderHook(() => useNDKWallet());

        expect(result.current.wallet).toBe(null);
        expect(result.current.balance).toBe(0);
        expect(result.current.loading).toBe(true);
        expect(result.current.error).toBe(null);
    });

    it("should load wallet from user's NIP-60 event", async () => {
        const mockWalletEvent = {
            ndk: mockNDK,
            rawEvent: vi.fn().mockReturnValue({}),
            decrypt: vi.fn().mockResolvedValue(undefined),
            content: "[]",
        };

        const mockWallet = {
            start: vi.fn().mockResolvedValue(undefined),
            on: vi.fn(),
            off: vi.fn(),
            balance: { amount: 100 },
            fetchMintList: vi.fn(),
        };

        mockNDK.fetchEvent.mockResolvedValue(mockWalletEvent);
        NDKCashuWallet.from = vi.fn().mockResolvedValue(mockWallet);

        const { result } = renderHook(() => useNDKWallet());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(mockNDK.fetchEvent).toHaveBeenCalledWith({
            kinds: [NDKKind.CashuWallet],
            authors: ["user123"],
        });

        expect(result.current.wallet).toBe(mockWallet);
        expect(result.current.balance).toBe(100);
        expect(mockNDK.wallet).toBe(mockWallet);
        expect(mockWallet.start).toHaveBeenCalled();
    });

    it("should handle no wallet found (user has no wallet)", async () => {
        mockNDK.fetchEvent.mockResolvedValue(null);

        const { result } = renderHook(() => useNDKWallet());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.wallet).toBe(null);
        expect(result.current.balance).toBe(0);
        expect(result.current.error).toBe(null);
    });

    it("should handle wallet loading errors", async () => {
        const error = new Error("Failed to decrypt wallet");
        mockNDK.fetchEvent.mockRejectedValue(error);

        const { result } = renderHook(() => useNDKWallet());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.wallet).toBe(null);
        expect(result.current.error).toBe(error);
    });

    it("should update balance when wallet emits balance_updated", async () => {
        const mockWallet = {
            start: vi.fn().mockResolvedValue(undefined),
            on: vi.fn(),
            off: vi.fn(),
            balance: { amount: 100 },
            fetchMintList: vi.fn(),
        };

        mockNDK.fetchEvent.mockResolvedValue({
            ndk: mockNDK,
            rawEvent: vi.fn().mockReturnValue({}),
        });
        NDKCashuWallet.from = vi.fn().mockResolvedValue(mockWallet);

        const { result } = renderHook(() => useNDKWallet());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        // Simulate balance update
        const balanceUpdateHandler = mockWallet.on.mock.calls.find((call) => call[0] === "balance_updated")?.[1];

        mockWallet.balance = { amount: 200 };
        balanceUpdateHandler?.();

        await waitFor(() => {
            expect(result.current.balance).toBe(200);
        });
    });
});
