import NDK, { NDKEvent, NDKKind, NDKPrivateKeySigner, NDKUser } from "@nostr-dev-kit/ndk";
import { mockProof } from "@nostr-dev-kit/ndk/test";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NDKCashuWallet } from "./index";

// Mock the dependent modules
vi.mock("@cashu/cashu-ts", () => {
    return {
        getDecodedToken: vi.fn().mockReturnValue({ mint: "https://mock-mint.com" }),
        CashuMint: vi.fn(),
        CashuWallet: vi.fn(),
    };
});

// Mock the NDKCashuDeposit module
vi.mock("../deposit.js", () => {
    // Define MockDeposit inside the factory function
    class MockDeposit {
        amount: number;
        mint?: string;
        wallet: any;
        on: any;
        emit: any;

        constructor(wallet: any, amount: number, mint?: string) {
            this.wallet = wallet;
            this.amount = amount;
            this.mint = mint;

            this.on = vi.fn();
            this.emit = vi.fn();
        }
    }

    return {
        NDKCashuDeposit: MockDeposit,
    };
});

// Mock the transaction creation functions
vi.mock("./txs.js", () => {
    return {
        createInTxEvent: vi.fn().mockReturnValue({
            id: "mock-tx-id",
            kind: 5500,
            content: "mock content",
        }),
        createOutTxEvent: vi.fn().mockReturnValue({
            id: "mock-out-tx-id",
            kind: 5500,
            content: "mock out content",
        }),
    };
});

// Create mocks for the NDK event and other dependencies
const createMockEvent = (rawEventData?: any) => {
    return {
        ndk: {},
        content: rawEventData?.content || "",
        kind: rawEventData?.kind || NDKKind.CashuWallet,
        tags: rawEventData?.tags || [],
        pubkey: rawEventData?.pubkey || "mock-pubkey",
        created_at: rawEventData?.created_at || Date.now() / 1000,
        id: "mock-id",
        sig: "mock-sig",
        tagId: vi.fn().mockReturnValue("mock-tag-id"),
        encrypt: vi.fn().mockResolvedValue(undefined),
        decrypt: vi.fn().mockResolvedValue(undefined),
        publish: vi.fn().mockResolvedValue(undefined),
        publishReplaceable: vi.fn().mockResolvedValue(undefined),
        dump: vi.fn(),
    };
};

// Mock the NDK event constructor with necessary NDKKind values
vi.mock("@nostr-dev-kit/ndk", async () => {
    return {
        NDKEvent: vi.fn().mockImplementation((_ndk, rawEvent) => createMockEvent(rawEvent)),
        NDKKind: {
            CashuWallet: 5300,
            CashuWalletBackup: 5301,
            CashuToken: 5302,
            CashuQuote: 5303,
            CashuWalletTx: 5500,
            EventDeletion: 5,
        },
        NDKPrivateKeySigner: vi.fn().mockImplementation(() => ({
            privateKey: "mock-private-key",
            user: vi.fn().mockResolvedValue({ pubkey: "mock-pubkey" }),
        })),
        default: vi.fn().mockImplementation(() => ({
            signer: {
                user: vi.fn().mockResolvedValue({ pubkey: "mock-user-pubkey" }),
            },
            activeUser: { pubkey: "mock-active-user-pubkey" },
            subscribe: vi.fn(),
        })),
    };
});

describe("NDKCashuWallet", () => {
    let ndk: NDK;
    let wallet: NDKCashuWallet;

    beforeEach(() => {
        // Reset mocks between tests
        vi.clearAllMocks();

        // Create an instance of NDK and the wallet
        ndk = new NDK();
        wallet = new NDKCashuWallet(ndk);

        // Setup basic test mocks and spies
        wallet.emit = vi.fn();

        // Mock state methods
        wallet.state = {
            getBalance: vi.fn().mockReturnValue(300),
            getMintsBalance: vi.fn().mockReturnValue({ "https://mock-mint.com": 300 }),
            update: vi.fn().mockResolvedValue({ created: createMockEvent(), deleted: [] }),
            getProofs: vi.fn().mockReturnValue([mockProof("existing-proof", 200)]),
            addToken: vi.fn(),
        } as any;

        // Add privkey and mints
        wallet._p2pk = "mock-pubkey";
        wallet.privkeys = new Map([["mock-pubkey", { privateKey: "mock-private-key" } as any]]);
        wallet.mints = ["https://mock-mint.com"];
    });

    describe("Basic Initialization", () => {
        it("should initialize with correct default values", () => {
            const newWallet = new NDKCashuWallet(ndk);

            expect(newWallet.type).toBe("nip-60");
            expect(newWallet.status).toBe("initial");
            expect(newWallet.walletId).toBe("nip-60");
        });
    });

    describe("Wallet Properties", () => {
        it("should get p2pk correctly", () => {
            expect(wallet.p2pk).toBe("mock-pubkey");
        });

        it("should return wallet balance", () => {
            const balance = wallet.balance;
            expect(balance).toEqual({ amount: 300 });
            expect(wallet.state.getBalance).toHaveBeenCalledWith({ onlyAvailable: true });
        });

        it("should return mint balances", () => {
            const mintBalances = wallet.mintBalances;
            expect(mintBalances).toEqual({ "https://mock-mint.com": 300 });
            expect(wallet.state.getMintsBalance).toHaveBeenCalledWith({ onlyAvailable: true });
        });

        it("should get mints with sufficient balance", () => {
            const mintsWithBalance = wallet.getMintsWithBalance(250);
            expect(mintsWithBalance).toEqual(["https://mock-mint.com"]);

            const mintsWithTooHighAmount = wallet.getMintsWithBalance(350);
            expect(mintsWithTooHighAmount).toEqual([]);
        });
    });

    describe("Wallet Management", () => {
        it("should warn about issues", () => {
            wallet.warn("Test warning message");

            expect(wallet.warnings.length).toBe(1);
            expect(wallet.warnings[0].msg).toBe("Test warning message");
            expect(wallet.emit).toHaveBeenCalledWith(
                "warning",
                expect.objectContaining({
                    msg: "Test warning message",
                }),
            );
        });
    });

    describe("Deposit Functionality", () => {
        it("should create deposit and set up handlers", () => {
            const deposit = wallet.deposit(100, "https://mock-mint.com");

            expect(deposit).toBeDefined();
            expect(deposit.amount).toBe(100);
            expect(deposit.mint).toBe("https://mock-mint.com");

            // Test the success handler by triggering it manually
            const mockToken = "cashuXYZ789";
            const successListener = deposit.on.mock.calls.find((call) => call[0] === "success");

            if (successListener && typeof successListener[1] === "function") {
                // Call the success handler directly
                successListener[1](mockToken);
                expect(wallet.state.addToken).toHaveBeenCalledWith(mockToken);
            }
        });
    });

    describe("Payment Functionality", () => {
        beforeEach(() => {
            // Setup for payment tests
            wallet.paymentHandler = {
                lnPay: vi.fn().mockResolvedValue({
                    preimage: "mock-preimage",
                    amount: 100,
                    fee: 1,
                }),
                cashuPay: vi.fn().mockResolvedValue({
                    proof: "mock-proof",
                    amount: 200,
                    mint: "https://mock-mint.com",
                }),
            } as any;
        });

        it("should handle LN payments", async () => {
            const payment = {
                lnInvoice: "lnbc1000...",
                amount: 100,
                comment: "Test payment",
            };

            const result = await wallet.lnPay(payment, true);

            expect(wallet.paymentHandler.lnPay).toHaveBeenCalledWith(payment, true);
            expect(result).toEqual({
                preimage: "mock-preimage",
                amount: 100,
                fee: 1,
            });
        });

        it("should handle Cashu payments", async () => {
            const payment = {
                cashu: {
                    receiver: "npub1...",
                    amount: 200,
                },
                amount: 200,
                content: "Test Cashu payment",
            };

            const result = await wallet.cashuPay(payment);

            expect(wallet.paymentHandler.cashuPay).toHaveBeenCalledWith(payment);
            expect(result).toEqual({
                proof: "mock-proof",
                amount: 200,
                mint: "https://mock-mint.com",
            });
        });
    });

    describe("Token Functionality", () => {
        beforeEach(() => {
            // Mock getCashuWallet which is used by receiveToken
            wallet.getCashuWallet = vi.fn().mockResolvedValue({
                receive: vi.fn().mockResolvedValue([mockProof("token-proof-1", 150)]),
            });

            // Use objectContaining to match proof without checking the random secret
            wallet.state.update = vi.fn().mockImplementation((params) => {
                expect(params).toMatchObject({
                    mint: "https://mock-mint.com",
                    store: expect.arrayContaining([
                        expect.objectContaining({
                            C: "token-proof-1",
                            amount: 150,
                        }),
                    ]),
                });
                return Promise.resolve({
                    created: createMockEvent(),
                    deleted: [],
                });
            });
        });

        it("should receive tokens", async () => {
            const token = "cashu:token123";
            const description = "Test token";

            await wallet.receiveToken(token, description);

            expect(wallet.getCashuWallet).toHaveBeenCalledWith("https://mock-mint.com");
            // The assertion for update is now handled in the mockImplementation above
        });
    });

    describe("Relay Configuration", () => {
        it("should encrypt relay tags in wallet payload", async () => {
            // Setup relaySet
            const mockRelay1 = { url: "wss://relay1.com" };
            const mockRelay2 = { url: "wss://relay2.com" };
            wallet.relaySet = {
                relays: new Set([mockRelay1, mockRelay2]),
            } as any;

            // Publish wallet
            await wallet.publish();

            // Get the mocked NDKEvent constructor and check what it was called with
            const NDKEvent = (await import("@nostr-dev-kit/ndk")).NDKEvent as any;
            const lastCall = NDKEvent.mock.calls[NDKEvent.mock.calls.length - 1];
            const eventInit = lastCall[1];

            // Parse the content to verify relay tags are included in encrypted payload
            const payload = JSON.parse(eventInit.content);
            const relayTags = payload.filter((tag: any) => tag[0] === "relay");

            expect(relayTags.length).toBe(2);
            expect(relayTags).toContainEqual(["relay", "wss://relay1.com"]);
            expect(relayTags).toContainEqual(["relay", "wss://relay2.com"]);
        });

        it("should load relay tags from encrypted content", async () => {
            const testWallet = new NDKCashuWallet(ndk);

            const encryptedContent = JSON.stringify([
                ["mint", "https://mint1.com"],
                ["privkey", "test-privkey"],
                ["relay", "wss://relay1.com"],
                ["relay", "wss://relay2.com"],
            ]);

            // Create a mock event with encrypted relay tags
            const mockEvent = {
                ndk,
                kind: NDKKind.CashuWallet,
                content: encryptedContent,
                decrypt: vi.fn().mockResolvedValue(undefined),
                tags: [],
                rawEvent: vi.fn().mockReturnValue({
                    kind: NDKKind.CashuWallet,
                    content: encryptedContent,
                    tags: [],
                    pubkey: "test-pubkey",
                    created_at: Math.floor(Date.now() / 1000),
                }),
            } as any;

            // Load from event
            await testWallet.loadFromEvent(mockEvent);

            // Verify relays were loaded
            expect((testWallet as any)._walletRelays).toEqual(["wss://relay1.com", "wss://relay2.com"]);
        });
    });
});
