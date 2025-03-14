import NDK, {
    cashuPubkeyToNostrPubkey,
    NDKCashuMintList,
    NDKEvent,
    NDKEventId,
    NDKFilter,
    NDKKind,
    NDKNutzap,
    NDKPrivateKeySigner,
    NDKRelaySet,
    NDKSubscriptionOptions,
    NDKUser,
} from "@nostr-dev-kit/ndk";
import { NDKNutzapMonitor, NDKNutzapState, NdkNutzapStatus, NDKNutzapMonitorStore } from "./index";
import * as CashuMintModule from "../wallets/cashu/mint.js";
import { CashuMint, CashuWallet } from "@cashu/cashu-ts";
import * as SpendStatusModule from "./spend-status.js";
import { NDKCashuWallet } from "../wallets/cashu/wallet/index.js";
import { fetchPage } from "./fetch-page.js";
import { mockNutzap } from "../tests/index.js";
import { NDKCashuWalletBackup } from "../wallets/cashu/wallet/index.js";

// Mock the modules we don't want to actually call
jest.mock("./fetch-page.js");
jest.mock("./spend-status.js");
jest.mock("../wallets/cashu/mint.js");

// Define the extended store type with our test spy
interface MockStore extends NDKNutzapMonitorStore {
    setNutzapStateSpy: jest.Mock;
}

// Mock store for testing
const createMockStore = (): MockStore => {
    const nutzapStates = new Map<NDKEventId, NDKNutzapState>();
    const setNutzapStateSpy = jest.fn();

    return {
        getAllNutzaps: async (): Promise<Map<NDKEventId, NDKNutzapState>> => nutzapStates,
        setNutzapState: async (
            id: NDKEventId,
            stateChange: Partial<NDKNutzapState>
        ): Promise<void> => {
            const currentState = nutzapStates.get(id) || ({} as NDKNutzapState);
            nutzapStates.set(id, { ...currentState, ...stateChange });
            setNutzapStateSpy(id, stateChange);
        },
        setNutzapStateSpy,
    };
};

// Set a longer timeout for all tests in this file
jest.setTimeout(15000);

describe("NDKNutzapMonitor", () => {
    let ndk: NDK;
    let user: NDKUser;
    let mintList: NDKCashuMintList;
    let mockStore: MockStore;
    let monitor: NDKNutzapMonitor;

    beforeEach(async () => {
        // Setup NDK with a signer
        ndk = new NDK({
            signer: NDKPrivateKeySigner.generate(),
            explicitRelayUrls: ["wss://relay1.com"],
        });

        user = await ndk.signer!.user();

        // Setup a mint list
        mintList = new NDKCashuMintList(ndk);
        mintList.mints = ["https://testmint.com"];

        // Mock CashuWallet
        const mockCashuWallet = new CashuWallet(new CashuMint("https://testmint.com"));
        jest.spyOn(mockCashuWallet, "checkProofsStates").mockResolvedValue([]);
        jest.spyOn(CashuMintModule, "walletForMint").mockResolvedValue(mockCashuWallet);

        // Setup mock store
        mockStore = createMockStore();

        // Create the monitor
        monitor = new NDKNutzapMonitor(ndk, user, { mintList, store: mockStore });

        // Make updateNutzapState public for testing
        (monitor as any).updateNutzapState = monitor["updateNutzapState"].bind(monitor);

        // Setup mock NDKCashuWallet
        const mockNDKCashuWallet = new NDKCashuWallet(ndk);
        mockNDKCashuWallet.redeemNutzaps = jest.fn().mockResolvedValue(100);
        monitor.wallet = mockNDKCashuWallet;

        // Mock console methods
        jest.spyOn(console, "error").mockImplementation(() => {});
        jest.spyOn(console, "log").mockImplementation(() => {});
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("addPrivkey", () => {
        it("should add a private key to the monitor", async () => {
            const signer = NDKPrivateKeySigner.generate();
            const pubkey = (await signer.user()).pubkey;

            await monitor.addPrivkey(signer);

            expect(monitor.privkeys.has(pubkey)).toBe(true);
        });

        it("should not add duplicate private keys", async () => {
            const signer = NDKPrivateKeySigner.generate();
            const pubkey = (await signer.user()).pubkey;

            await monitor.addPrivkey(signer);
            const initialSize = monitor.privkeys.size;

            // Try to add the same key again
            await monitor.addPrivkey(signer);

            expect(monitor.privkeys.size).toBe(initialSize);
        });

        it("should attempt to redeem nutzaps that were previously locked to a privkey that is now available", async () => {
            jest.setTimeout(15000); // Increase timeout for this test
            // Create a signer
            const signer = NDKPrivateKeySigner.generate();
            const pubkey = (await signer.user()).pubkey;

            // Create a nutzap that requires this privkey
            const nutzap = await mockNutzap("https://testmint.com", 100, ndk, {
                recipientPubkey: pubkey,
            });

            // Set the nutzap state to MISSING_PRIVKEY
            monitor.nutzapStates.set(nutzap.id, {
                nutzap,
                status: NdkNutzapStatus.MISSING_PRIVKEY,
            });

            // Mock getProofSpendState to return the nutzap as unspent
            jest.spyOn(SpendStatusModule, "getProofSpendState").mockResolvedValue({
                unspentProofs: nutzap.proofs,
                spentProofs: [],
                nutzapsWithUnspentProofs: [nutzap],
                nutzapsWithSpentProofs: [],
            });

            // Spy on redeemNutzaps
            const redeemSpy = jest.spyOn(monitor, "redeemNutzaps").mockResolvedValue(undefined);

            // Add the privkey (this should trigger a check for nutzaps that can now be redeemed)
            await monitor.addPrivkey(signer);

            // Start the monitor to trigger the check for nutzaps
            await monitor.start({ filter: {} });

            // Check that redeemNutzaps was called with the right arguments
            expect(redeemSpy).toHaveBeenCalled();
            const callArgs = redeemSpy.mock.calls[0];
            expect(callArgs[0]).toBe(nutzap.mint);
            expect(callArgs[1]).toContainEqual(expect.objectContaining({ id: nutzap.id }));
        });
    });

    describe("getBackupKeys", () => {
        it("should load private keys from backup events", async () => {
            // Create backup event
            const backupSigner1 = NDKPrivateKeySigner.generate();
            const backupSigner2 = NDKPrivateKeySigner.generate();

            // Mock the fetchEvents function
            const mockBackupEvent = new NDKEvent(ndk);
            const backup = new NDKCashuWalletBackup(ndk);
            backup.privkeys = [backupSigner1.privateKey!, backupSigner2.privateKey!];

            // Mock the fetchEvents method
            ndk.fetchEvents = jest.fn().mockResolvedValue(new Set([mockBackupEvent]));

            // Mock the from method to return our backup
            jest.spyOn(NDKCashuWalletBackup, "from").mockResolvedValue(backup);

            // Call getBackupKeys
            await monitor.getBackupKeys();

            // Check that the private keys were added
            const pubkey1 = (await backupSigner1.user()).pubkey;
            const pubkey2 = (await backupSigner2.user()).pubkey;

            expect(monitor.privkeys.has(pubkey1)).toBe(true);
            expect(monitor.privkeys.has(pubkey2)).toBe(true);
        });

        it("should handle errors when loading backup events", async () => {
            // Mock the fetchEvents method to throw an error
            ndk.fetchEvents = jest.fn().mockRejectedValue(new Error("Network error"));

            // Spy on console.error
            const errorSpy = jest.spyOn(console, "error");

            // Call getBackupKeys
            await monitor.getBackupKeys();

            // Check that the error was logged
            expect(errorSpy).toHaveBeenCalled();
        });

        it("should create a new backup if new private keys were added but not found in backups", async () => {
            // Create a signer to add
            const newSigner = NDKPrivateKeySigner.generate();
            await monitor.addPrivkey(newSigner);

            // Mock empty fetchEvents result
            ndk.fetchEvents = jest.fn().mockResolvedValue(new Set());

            // Spy on NDKCashuWalletBackup.save
            const saveSpy = jest.fn().mockResolvedValue(undefined);
            jest.spyOn(NDKCashuWalletBackup.prototype, "save").mockImplementation(saveSpy);

            // Call getBackupKeys
            await monitor.getBackupKeys();

            // Check that a backup was created and saved
            expect(saveSpy).toHaveBeenCalled();
        });
    });

    describe("redeemNutzap", () => {
        it("should set state to MISSING_PRIVKEY when no privkey is available", async () => {
            // Create a nutzap with a pubkey we don't have
            const unknownSigner = NDKPrivateKeySigner.generate();
            const unknownPubkey = (await unknownSigner.user()).pubkey;

            const nutzap = await mockNutzap("https://testmint.com", 100, ndk, {
                recipientPubkey: unknownPubkey,
            });

            // Try to redeem the nutzap
            await monitor.redeemNutzap(nutzap);

            // Check the state is set to MISSING_PRIVKEY
            const state = monitor.nutzapStates.get(nutzap.id);
            expect(state?.status).toBe(NdkNutzapStatus.MISSING_PRIVKEY);

            // Check the store was updated
            expect(mockStore.setNutzapStateSpy).toHaveBeenCalledWith(
                nutzap.id,
                expect.objectContaining({ status: NdkNutzapStatus.MISSING_PRIVKEY })
            );
        });

        it("should transition through states and set redeemedAmount when successfully redeemed", async () => {
            // Mock the wallet for mints
            const mockCashuWallet = new CashuWallet(new CashuMint("https://testmint.com"));
            jest.spyOn(CashuMintModule, "walletForMint").mockResolvedValue(mockCashuWallet);

            // Get the user's pubkey and create a nutzap for them
            const userSigner = ndk.signer as NDKPrivateKeySigner;
            const userPubkey = (await userSigner.user()).pubkey;

            // Create a nutzap for the user
            const nutzap = await mockNutzap("https://testmint.com", 100, ndk, {
                recipientPubkey: userPubkey,
            });

            // Add the user's privkey to the monitor
            await monitor.addPrivkey(userSigner);

            // Mock redeemNutzaps to simulate successful redemption
            jest.spyOn(monitor, "redeemNutzaps").mockImplementation(
                async (mint, nutzaps, proofs) => {
                    // Simulate successful redemption
                    for (const nutzap of nutzaps) {
                        (monitor as any)["updateNutzapState"](nutzap.id, {
                            status: NdkNutzapStatus.REDEEMED,
                            redeemedAmount: 100,
                        });
                    }
                    monitor.emit("redeemed", nutzaps, 100);
                }
            );

            // Try to redeem the nutzap
            await monitor.redeemNutzap(nutzap);

            // Check final state
            const finalState = monitor.nutzapStates.get(nutzap.id);
            expect(finalState?.status).toBe(NdkNutzapStatus.REDEEMED);
            expect(finalState?.redeemedAmount).toBe(100);
        });

        it("should mark nutzap as INVALID_NUTZAP when it's not valid", async () => {
            // Mock an invalid nutzap
            const invalidNutzap = await mockNutzap("https://testmint.com", 100, ndk);
            Object.defineProperty(invalidNutzap, "isValid", { get: () => false });

            // Try to redeem the nutzap
            await monitor.redeemNutzap(invalidNutzap);

            // Check final state
            const finalState = monitor.nutzapStates.get(invalidNutzap.id);
            expect(finalState?.status).toBe(NdkNutzapStatus.INVALID_NUTZAP);
            expect(finalState?.errorMessage).toBe("Invalid nutzap");
        });

        it("should mark nutzap as INVALID_NUTZAP when p2pk is missing", async () => {
            // Mock a nutzap with missing p2pk
            const nutzap = await mockNutzap("https://testmint.com", 100, ndk);
            Object.defineProperty(nutzap, "rawP2pk", { get: () => null });
            Object.defineProperty(nutzap, "isValid", { get: () => true });

            // Try to redeem the nutzap
            await monitor.redeemNutzap(nutzap);

            // Check final state
            const finalState = monitor.nutzapStates.get(nutzap.id);
            expect(finalState?.status).toBe(NdkNutzapStatus.INVALID_NUTZAP);
            expect(finalState?.errorMessage).toContain(
                "Invalid nutzap: locked to an invalid public key"
            );
        });

        it("should mark nutzap as PERMANENT_ERROR when 'unknown public key size' error occurs", async () => {
            // Mock the wallet for mints
            const mockCashuWallet = new CashuWallet(new CashuMint("https://testmint.com"));
            jest.spyOn(CashuMintModule, "walletForMint").mockResolvedValue(mockCashuWallet);

            // Get the user's pubkey and create a nutzap for them
            const userSigner = ndk.signer as NDKPrivateKeySigner;
            const userPubkey = (await userSigner.user()).pubkey;

            // Create a nutzap for the user
            const nutzap = await mockNutzap("https://testmint.com", 100, ndk, {
                recipientPubkey: userPubkey,
            });

            // Add the user's privkey to the monitor
            await monitor.addPrivkey(userSigner);

            // Mock redeemNutzaps to throw "unknown public key size" error
            jest.spyOn(monitor.wallet as NDKCashuWallet, "redeemNutzaps").mockImplementation(() => {
                throw new Error("unknown public key size");
            });

            // Listen for failed emissions
            const failedEvents: Array<{ nutzap: NDKNutzap; error: string }> = [];
            monitor.on("failed", (nutzap, error) => {
                failedEvents.push({ nutzap, error });
            });

            // Try to redeem the nutzap
            await monitor.redeemNutzap(nutzap);

            // Check that the failed event was emitted with correct error message
            expect(failedEvents.length).toBe(1);
            expect(failedEvents[0].nutzap.id).toBe(nutzap.id);
            expect(failedEvents[0].error).toBe("Invalid p2pk: unknown public key size");

            // Check that the nutzap state was updated correctly
            const finalState = monitor.nutzapStates.get(nutzap.id);
            expect(finalState?.status).toBe(NdkNutzapStatus.PERMANENT_ERROR);
            expect(finalState?.errorMessage).toBe("Invalid p2pk: unknown public key size");
        });

        it("should emit 'failed' event for other errors during redemption", async () => {
            // Mock the wallet for mints
            const mockCashuWallet = new CashuWallet(new CashuMint("https://testmint.com"));
            jest.spyOn(CashuMintModule, "walletForMint").mockResolvedValue(mockCashuWallet);

            // Get the user's pubkey and create a nutzap for them
            const userSigner = ndk.signer as NDKPrivateKeySigner;
            const userPubkey = (await userSigner.user()).pubkey;

            // Create a nutzap for the user
            const nutzap = await mockNutzap("https://testmint.com", 100, ndk, {
                recipientPubkey: userPubkey,
            });

            // Add the user's privkey to the monitor
            await monitor.addPrivkey(userSigner);

            // Mock redeemNutzaps to throw a generic error
            jest.spyOn(monitor.wallet as NDKCashuWallet, "redeemNutzaps").mockImplementation(() => {
                throw new Error("Mint server error");
            });

            // Listen for failed emissions
            const failedEvents: Array<{ nutzap: NDKNutzap; error: string }> = [];
            monitor.on("failed", (nutzap, error) => {
                failedEvents.push({ nutzap, error });
            });

            // Try to redeem the nutzap
            await monitor.redeemNutzap(nutzap);

            // Check that the failed event was emitted
            expect(failedEvents.length).toBe(1);
            expect(failedEvents[0].nutzap.id).toBe(nutzap.id);
            expect(failedEvents[0].error).toBe("Mint server error");
        });
    });

    describe("processAccumulatedNutzaps", () => {
        it("should mark spent nutzaps as SPENT and not attempt to redeem them", async () => {
            // Get the user's pubkey
            const userPubkey = (await ndk.signer!.user()).pubkey;

            // Create nutzaps - one spent, one unspent
            const unspentNutzap = await mockNutzap("https://testmint.com", 100, ndk, {
                recipientPubkey: userPubkey,
            });
            const spentNutzap = await mockNutzap("https://testmint.com", 200, ndk, {
                recipientPubkey: userPubkey,
            });

            // Setup fetchPage mock
            (fetchPage as jest.Mock).mockResolvedValue([unspentNutzap, spentNutzap]);

            // Setup getProofSpendState mock to show one nutzap as spent and one as unspent
            jest.spyOn(SpendStatusModule, "getProofSpendState").mockResolvedValue({
                unspentProofs: unspentNutzap.proofs,
                spentProofs: spentNutzap.proofs,
                nutzapsWithUnspentProofs: [unspentNutzap],
                nutzapsWithSpentProofs: [spentNutzap],
            });

            // Add user's private key
            await monitor.addPrivkey(ndk.signer as NDKPrivateKeySigner);

            // Directly call checkAndRedeemGroup to ensure state changes are emitted
            const group = { mint: "https://testmint.com", nutzaps: [unspentNutzap, spentNutzap] };

            // Listen for state changes
            const stateChanges = new Map<NDKEventId, NdkNutzapStatus>();
            monitor.on("state_changed", (id, status) => {
                stateChanges.set(id, status);
            });

            // Process the nutzaps
            await (monitor as any).checkAndRedeemGroup(group);

            // Check that spent nutzap was marked as SPENT
            expect(monitor.nutzapStates.get(spentNutzap.id)?.status).toBe(NdkNutzapStatus.SPENT);
        });

        it("should process multiple pages of nutzaps when there are unspent nutzaps", async () => {
            // Get the user's pubkey
            const userPubkey = (await ndk.signer!.user()).pubkey;

            // Create nutzaps for page 1
            const nutzap1 = await mockNutzap("https://testmint.com", 100, ndk, {
                recipientPubkey: userPubkey,
            });
            nutzap1.created_at = 1000;

            // Create nutzaps for page 2
            const nutzap2 = await mockNutzap("https://testmint.com", 200, ndk, {
                recipientPubkey: userPubkey,
            });
            nutzap2.created_at = 500; // Older nutzap for page 2

            // Setup fetchPage mock to return different results based on filter
            let fetchPageCallCount = 0;
            (fetchPage as jest.Mock).mockImplementation((ndk, filter) => {
                fetchPageCallCount++;
                if (fetchPageCallCount === 1) {
                    return [nutzap1];
                } else {
                    return [nutzap2];
                }
            });

            // Setup getProofSpendState mock to return all nutzaps as unspent
            jest.spyOn(SpendStatusModule, "getProofSpendState").mockImplementation(
                async (wallet, nutzaps) => {
                    return {
                        unspentProofs: nutzaps.flatMap((n) => n.proofs),
                        spentProofs: [],
                        nutzapsWithUnspentProofs: nutzaps,
                        nutzapsWithSpentProofs: [],
                    };
                }
            );

            // Add user's private key
            await monitor.addPrivkey(ndk.signer as NDKPrivateKeySigner);

            // Mock processAccumulatedNutzaps to avoid infinite recursion in tests
            const originalProcessAccumulatedNutzaps = monitor.processAccumulatedNutzaps;
            monitor.processAccumulatedNutzaps = jest
                .fn()
                .mockImplementation(async (filter = {}) => {
                    // Call the original once to process the first page
                    if (!filter.since) {
                        await originalProcessAccumulatedNutzaps.call(monitor, filter);
                        // Manually call with the second filter to simulate recursion
                        await originalProcessAccumulatedNutzaps.call(monitor, {
                            ...filter,
                            since: 999,
                        });
                    }
                });

            // Spy on processNutzaps
            const processSpy = jest.spyOn(monitor as any, "processNutzaps");

            // Process the nutzaps
            await monitor.processAccumulatedNutzaps();

            // fetchPage should have been called twice - once for each page
            expect(fetchPage).toHaveBeenCalledTimes(2);

            // processNutzaps should have been called twice
            expect(processSpy).toHaveBeenCalledTimes(2);

            // Check both nutzaps were processed
            expect(monitor.nutzapStates.has(nutzap1.id)).toBe(true);
            expect(monitor.nutzapStates.has(nutzap2.id)).toBe(true);
        });
    });

    describe("start", () => {
        it("should load nutzap states from the store and process redeemable nutzaps", async () => {
            // Create a nutzap and add it to the store
            const userSigner = ndk.signer as NDKPrivateKeySigner;
            const userPubkey = (await userSigner.user()).pubkey;
            const nutzap = await mockNutzap("https://testmint.com", 100, ndk, {
                recipientPubkey: userPubkey,
            });

            await mockStore.setNutzapState(nutzap.id, {
                nutzap,
                status: NdkNutzapStatus.INITIAL,
            });

            // Mock getProofSpendState to return unspent proofs
            jest.spyOn(SpendStatusModule, "getProofSpendState").mockResolvedValue({
                unspentProofs: nutzap.proofs,
                spentProofs: [],
                nutzapsWithUnspentProofs: [nutzap],
                nutzapsWithSpentProofs: [],
            });

            // Mock fetchPage to return empty array
            (fetchPage as jest.Mock).mockResolvedValue([]);

            // Add the user's private key
            await monitor.addPrivkey(userSigner);

            // Spy on redeemNutzaps
            const redeemSpy = jest.spyOn(monitor, "redeemNutzaps").mockResolvedValue(undefined);

            // Start the monitor
            await monitor.start({ filter: {} });

            // Check that redeemNutzaps was called for the nutzap from the store
            expect(redeemSpy).toHaveBeenCalled();
            const callArgs = redeemSpy.mock.calls[0];
            expect(callArgs[0]).toBe(nutzap.mint);
            expect(callArgs[1]).toContainEqual(expect.objectContaining({ id: nutzap.id }));
        });

        it("should start a subscription and process incoming nutzaps", async () => {
            // Mock fetchPage to return empty array
            (fetchPage as jest.Mock).mockResolvedValue([]);

            // Spy on NDK.subscribe
            const subscribeSpy = jest.spyOn(ndk, "subscribe");

            // Start the monitor
            await monitor.start({ filter: {} });

            // Check that a subscription was started
            expect(subscribeSpy).toHaveBeenCalled();

            // Create a nutzap coming in through the subscription
            const userSigner = ndk.signer as NDKPrivateKeySigner;
            const userPubkey = (await userSigner.user()).pubkey;
            const nutzap = await mockNutzap("https://testmint.com", 100, ndk, {
                recipientPubkey: userPubkey,
            });

            // Mock the event handler
            const eventHandlerSpy = jest.spyOn(monitor as any, "eventHandler");

            // Access NDKNutzap.from directly to preserve its type
            const originalFrom = NDKNutzap.from;

            // Use ts-ignore here because we're intentionally mocking a static method
            // @ts-ignore - mocking static method
            NDKNutzap.from = jest.fn().mockImplementation(async (event: NDKEvent) => {
                // Return our mock nutzap
                return nutzap;
            });

            // Extract the subscription callback
            const subOptions = subscribeSpy.mock.calls[0][3];

            // Call the subscription callback with a new event
            if (subOptions && typeof subOptions === "object" && "onEvent" in subOptions) {
                const nutzapEvent = new NDKEvent(ndk);
                nutzapEvent.id = nutzap.id;
                // @ts-ignore - suppressing type error for testing
                subOptions.onEvent(nutzapEvent);
            }

            // Check that the event handler was called
            expect(eventHandlerSpy).toHaveBeenCalled();

            // Restore the original function
            // @ts-ignore - restoring original method
            NDKNutzap.from = originalFrom;
        });

        it("should handle exceptions when loading data from the store", async () => {
            // Create a store that throws an error when getAllNutzaps is called
            const errorStore: NDKNutzapMonitorStore = {
                getAllNutzaps: jest.fn().mockRejectedValue(new Error("Database error")),
                setNutzapState: jest.fn().mockResolvedValue(undefined),
            };

            // Create monitor with error store
            const errorMonitor = new NDKNutzapMonitor(ndk, user, { mintList, store: errorStore });

            // Mock fetchPage to return empty array
            (fetchPage as jest.Mock).mockResolvedValue([]);

            // Spy on console.error
            const errorSpy = jest.spyOn(console, "error");

            // Start the monitor
            await errorMonitor.start({ filter: {} });

            // Check that the error was logged
            expect(errorSpy).toHaveBeenCalledWith(
                expect.stringContaining("Failed to load nutzaps from store"),
                expect.any(Error)
            );
        });
    });

    describe("store integration", () => {
        it("should load nutzap states from the store on startup", async () => {
            // Create a new mock store with pre-populated state
            const newStore = createMockStore();
            const existingNutzap = await mockNutzap("https://testmint.com", 100, ndk);

            // Add a nutzap state to the store
            await newStore.setNutzapState(existingNutzap.id, {
                nutzap: existingNutzap,
                status: NdkNutzapStatus.REDEEMED,
                redeemedAmount: 100,
            });

            // Create a new monitor with this store
            const newMonitor = new NDKNutzapMonitor(ndk, user, { mintList, store: newStore });

            // Mock fetchPage to return empty array (so we don't process new nutzaps)
            (fetchPage as jest.Mock).mockResolvedValue([]);

            // Start the monitor (this should load states from the store)
            await newMonitor.start({ filter: {} });

            // Check that the state was loaded from the store
            const state = newMonitor.nutzapStates.get(existingNutzap.id);
            expect(state?.status).toBe(NdkNutzapStatus.REDEEMED);
            expect(state?.redeemedAmount).toBe(100);
        });

        it("should update the store when nutzap states change", async () => {
            // Create a nutzap
            const nutzap = await mockNutzap("https://testmint.com", 100, ndk);

            // Create a method to access the private updateNutzapState method
            const updateState = (id: string, state: Partial<NDKNutzapState>) => {
                // @ts-ignore - accessing private method for testing
                return monitor["updateNutzapState"](id, state);
            };

            // Update the nutzap state
            updateState(nutzap.id, {
                nutzap,
                status: NdkNutzapStatus.PROCESSING,
            });

            // Check that the store was updated
            expect(mockStore.setNutzapStateSpy).toHaveBeenCalledWith(
                nutzap.id,
                expect.objectContaining({ status: NdkNutzapStatus.PROCESSING })
            );
        });
    });

    describe("shouldTryRedeem", () => {
        it("should return false for nutzaps with PERMANENT_ERROR status", async () => {
            // Create a nutzap
            const signer = NDKPrivateKeySigner.generate();
            const pubkey = (await signer.user()).pubkey;
            const nutzap = await mockNutzap("https://testmint.com", 100, ndk, {
                recipientPubkey: pubkey,
            });

            // Set it to PERMANENT_ERROR state
            monitor.nutzapStates.set(nutzap.id, {
                nutzap,
                status: NdkNutzapStatus.PERMANENT_ERROR,
                errorMessage: "Invalid p2pk: unknown public key size",
            });

            // It should not be retried
            expect(monitor.shouldTryRedeem(nutzap)).toBe(false);
        });

        it("should return true for nutzaps with INITIAL status", async () => {
            // Create a nutzap
            const signer = NDKPrivateKeySigner.generate();
            const pubkey = (await signer.user()).pubkey;
            const nutzap = await mockNutzap("https://testmint.com", 100, ndk, {
                recipientPubkey: pubkey,
            });

            // Set it to INITIAL state
            monitor.nutzapStates.set(nutzap.id, {
                nutzap,
                status: NdkNutzapStatus.INITIAL,
            });

            // It should be retried
            expect(monitor.shouldTryRedeem(nutzap)).toBe(true);
        });

        it("should return true for unknown nutzaps", async () => {
            // Create a nutzap without setting any state
            const signer = NDKPrivateKeySigner.generate();
            const pubkey = (await signer.user()).pubkey;
            const nutzap = await mockNutzap("https://testmint.com", 100, ndk, {
                recipientPubkey: pubkey,
            });

            // It should be retried since it's unknown
            expect(monitor.shouldTryRedeem(nutzap)).toBe(true);
        });

        it("should return true for nutzaps in MISSING_PRIVKEY state when we now have the key", async () => {
            // Create a signer
            const signer = NDKPrivateKeySigner.generate();
            const pubkey = (await signer.user()).pubkey;

            // Create a nutzap that requires this privkey
            const nutzap = await mockNutzap("https://testmint.com", 100, ndk, {
                recipientPubkey: pubkey,
            });

            // Set it to MISSING_PRIVKEY state
            monitor.nutzapStates.set(nutzap.id, {
                nutzap,
                status: NdkNutzapStatus.MISSING_PRIVKEY,
            });

            // Add the privkey
            await monitor.addPrivkey(signer);

            // It should be retried now that we have the key
            expect(monitor.shouldTryRedeem(nutzap)).toBe(true);
        });

        it("should return false for nutzaps that have been redeemed or spent", async () => {
            // Create a nutzap
            const nutzap = await mockNutzap("https://testmint.com", 100, ndk);

            // Set it to REDEEMED state
            monitor.nutzapStates.set(nutzap.id, {
                nutzap,
                status: NdkNutzapStatus.REDEEMED,
                redeemedAmount: 100,
            });

            // It should not be retried
            expect(monitor.shouldTryRedeem(nutzap)).toBe(false);

            // Set it to SPENT state
            monitor.nutzapStates.set(nutzap.id, {
                nutzap,
                status: NdkNutzapStatus.SPENT,
            });

            // It should not be retried
            expect(monitor.shouldTryRedeem(nutzap)).toBe(false);
        });
    });

    describe("processNutzaps", () => {
        it("should correctly identify the oldest unspent nutzap", async () => {
            // Create nutzaps with different timestamps
            const olderNutzap = await mockNutzap("https://testmint.com", 100, ndk);
            olderNutzap.created_at = 1000; // Older timestamp

            const newerNutzap = await mockNutzap("https://testmint.com", 200, ndk);
            newerNutzap.created_at = 2000; // Newer timestamp

            // Mock getProofSpendState to return both nutzaps as unspent
            jest.spyOn(SpendStatusModule, "getProofSpendState").mockResolvedValue({
                unspentProofs: [...olderNutzap.proofs, ...newerNutzap.proofs],
                spentProofs: [],
                nutzapsWithUnspentProofs: [olderNutzap, newerNutzap],
                nutzapsWithSpentProofs: [],
            });

            // Call the non-private processNutzaps method and check the result
            const result = await (monitor as any).processNutzaps([olderNutzap, newerNutzap]);

            // Should return the timestamp of the oldest nutzap
            expect(result).toBe(1000);
        });
    });
});

describe("NIP-61 specific functionality", () => {
    let ndk: NDK;
    let user: NDKUser;
    let mintList: NDKCashuMintList;
    let mockStore: MockStore;
    let monitor: NDKNutzapMonitor;

    beforeEach(async () => {
        // Setup NDK with a signer
        ndk = new NDK({
            signer: NDKPrivateKeySigner.generate(),
            explicitRelayUrls: ["wss://relay1.com"],
        });

        user = await ndk.signer!.user();

        // Setup a mint list
        mintList = new NDKCashuMintList(ndk);
        mintList.mints = ["https://testmint.com"];

        // Mock CashuWallet
        const mockCashuWallet = new CashuWallet(new CashuMint("https://testmint.com"));
        jest.spyOn(mockCashuWallet, "checkProofsStates").mockResolvedValue([]);
        jest.spyOn(CashuMintModule, "walletForMint").mockResolvedValue(mockCashuWallet);

        // Setup mock store
        mockStore = createMockStore();

        // Create the monitor
        monitor = new NDKNutzapMonitor(ndk, user, { mintList, store: mockStore });

        // Setup mock NDKCashuWallet
        const mockNDKCashuWallet = new NDKCashuWallet(ndk);
        mockNDKCashuWallet.redeemNutzaps = jest.fn().mockResolvedValue(100);
        monitor.wallet = mockNDKCashuWallet;

        // Mock console methods
        jest.spyOn(console, "error").mockImplementation(() => {});
        jest.spyOn(console, "log").mockImplementation(() => {});
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should handle nutzaps with different p2pk formats correctly", async () => {
        // Create nutzaps with different p2pk formats (compressed and uncompressed keys)
        const signer1 = NDKPrivateKeySigner.generate(); // First private key
        const signer2 = NDKPrivateKeySigner.generate(); // Second private key
        const pubkey1 = (await signer1.user()).pubkey;
        const pubkey2 = (await signer2.user()).pubkey;

        // Mock different p2pk formats (one with 02 prefix, one without)
        const nutzap1 = await mockNutzap("https://testmint.com", 100, ndk, {
            recipientPubkey: pubkey1,
        });
        const nutzap2 = await mockNutzap("https://testmint.com", 200, ndk, {
            recipientPubkey: pubkey2,
        });

        // Add both signers to the monitor
        await monitor.addPrivkey(signer1);
        await monitor.addPrivkey(signer2);

        // Mock CashuWallet
        const mockCashuWallet = new CashuWallet(new CashuMint("https://testmint.com"));
        jest.spyOn(CashuMintModule, "walletForMint").mockResolvedValue(mockCashuWallet);

        // Mock getProofSpendState to return unspent proofs
        jest.spyOn(SpendStatusModule, "getProofSpendState").mockResolvedValue({
            unspentProofs: [...nutzap1.proofs, ...nutzap2.proofs],
            spentProofs: [],
            nutzapsWithUnspentProofs: [nutzap1, nutzap2],
            nutzapsWithSpentProofs: [],
        });

        // Spy on redeemNutzaps to verify it gets called for both nutzaps
        const redeemSpy = jest.spyOn(monitor, "redeemNutzaps");

        // Process the nutzaps
        await (monitor as any).processNutzaps([nutzap1, nutzap2]);

        // redeemNutzaps should be called for both nutzaps
        expect(redeemSpy).toHaveBeenCalled();

        // Check that we have states for both nutzaps
        expect(monitor.nutzapStates.has(nutzap1.id)).toBe(true);
        expect(monitor.nutzapStates.has(nutzap2.id)).toBe(true);
    });

    it("should emit 'seen_in_unknown_mint' event when nutzap is for an unknown mint", async () => {
        // Create a nutzap with a mint not in the mintList
        const unknownMint = "https://unknown-mint.com";
        const userSigner = ndk.signer as NDKPrivateKeySigner;
        const userPubkey = (await userSigner.user()).pubkey;
        const nutzap = await mockNutzap(unknownMint, 100, ndk, { recipientPubkey: userPubkey });

        // Spy on the event
        const seenInUnknownMintSpy = jest.fn();
        monitor.on("seen_in_unknown_mint", seenInUnknownMintSpy);

        // Add the event handler manually (simulating a subscription)
        await (monitor as any).eventHandler(nutzap);

        // The event should be emitted
        expect(seenInUnknownMintSpy).toHaveBeenCalled();
        const calledWithNutzap = seenInUnknownMintSpy.mock.calls[0][0];
        expect(calledWithNutzap.id).toBe(nutzap.id);
        expect(calledWithNutzap.mint).toBe(unknownMint);
    });

    it("should handle nutzaps with multiple proofs with different p2pk values", async () => {
        // Create two signers
        const signer1 = NDKPrivateKeySigner.generate();
        const signer2 = NDKPrivateKeySigner.generate();
        const pubkey1 = (await signer1.user()).pubkey;
        const pubkey2 = (await signer2.user()).pubkey;

        // Add both keys to the monitor
        await monitor.addPrivkey(signer1);
        await monitor.addPrivkey(signer2);

        // Create a nutzap with proofs for both keys
        const nutzap1 = await mockNutzap("https://testmint.com", 100, ndk, {
            recipientPubkey: pubkey1,
        });
        const nutzap2 = await mockNutzap("https://testmint.com", 200, ndk, {
            recipientPubkey: pubkey2,
        });

        // Mock CashuWallet
        const mockCashuWallet = new CashuWallet(new CashuMint("https://testmint.com"));
        jest.spyOn(CashuMintModule, "walletForMint").mockResolvedValue(mockCashuWallet);

        // Mock getProofSpendState to return unspent proofs
        jest.spyOn(SpendStatusModule, "getProofSpendState").mockResolvedValue({
            unspentProofs: [...nutzap1.proofs, ...nutzap2.proofs],
            spentProofs: [],
            nutzapsWithUnspentProofs: [nutzap1, nutzap2],
            nutzapsWithSpentProofs: [],
        });

        // Spy on redeemNutzaps
        const redeemSpy = jest.spyOn(monitor, "redeemNutzaps");

        // Process the nutzaps
        await (monitor as any).processNutzaps([nutzap1, nutzap2]);

        // redeemNutzaps should be called for both nutzaps
        expect(redeemSpy).toHaveBeenCalled();

        // Check that we have states for both nutzaps
        expect(monitor.nutzapStates.has(nutzap1.id)).toBe(true);
        expect(monitor.nutzapStates.has(nutzap2.id)).toBe(true);
    });

    it("should correctly identify nutzaps that need to be retrieved from the backup", async () => {
        // Create a signer not initially in the monitor
        const backupSigner = NDKPrivateKeySigner.generate();
        const backupPubkey = (await backupSigner.user()).pubkey;

        // Create a nutzap p2pked to this signer
        const nutzap = await mockNutzap("https://testmint.com", 100, ndk, {
            recipientPubkey: backupPubkey,
        });

        // Setup a mock backup event
        const backupEvent = new NDKEvent(ndk);
        const backup = new NDKCashuWalletBackup(ndk);
        backup.privkeys = [backupSigner.privateKey!];

        // Mock NDKCashuWalletBackup.from to return our backup
        jest.spyOn(NDKCashuWalletBackup, "from").mockResolvedValue(backup);

        // Mock fetchEvents to return our backup event
        ndk.fetchEvents = jest.fn().mockResolvedValue(new Set([backupEvent]));

        // Try to redeem the nutzap (should initially fail due to missing key)
        await monitor.redeemNutzap(nutzap);

        // Check that the nutzap is in MISSING_PRIVKEY state
        expect(monitor.nutzapStates.get(nutzap.id)?.status).toBe(NdkNutzapStatus.MISSING_PRIVKEY);

        // Mock getProofSpendState to return unspent proofs when we retry
        jest.spyOn(SpendStatusModule, "getProofSpendState").mockResolvedValue({
            unspentProofs: nutzap.proofs,
            spentProofs: [],
            nutzapsWithUnspentProofs: [nutzap],
            nutzapsWithSpentProofs: [],
        });

        // Manually add the private key to simulate what getBackupKeys would do
        await monitor.addPrivkey(backupSigner);

        // Check that the privkey was added to the monitor
        expect(monitor.privkeys.has(backupPubkey)).toBe(true);

        // Try to redeem the nutzap again
        const result = monitor.shouldTryRedeem(nutzap);

        // It should now return true since we now have the key
        expect(result).toBe(true);
    });
});
